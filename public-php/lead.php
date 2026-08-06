<?php
// Приём заявок с сайта dez-federation.ru и отправка в Telegram-группу.
// Разместить на хостинге по пути: public_html/api/lead.php
// Токен: либо переменная окружения TELEGRAM_BOT_TOKEN, либо константа ниже.

const TELEGRAM_TOKEN_FALLBACK = 'ВСТАВЬТЕ_ТОКЕН_БОТА';
const TELEGRAM_CHAT_ID = '-5244841627';
const ALLOWED_ORIGIN = 'https://dez-federation.ru';
const RATE_LIMIT = 5;         // заявок
const RATE_WINDOW = 60;       // секунд

header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json; charset=utf-8');

function respond(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['ok' => false, 'error' => 'method_not_allowed']);
}

$raw = file_get_contents('php://input');
if ($raw === false || strlen($raw) > 8192) {
    respond(400, ['ok' => false, 'error' => 'bad_request']);
}
$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, ['ok' => false, 'error' => 'invalid_json']);
}

// Honeypot: боты заполняют скрытое поле.
if (!empty($data['company'])) {
    respond(200, ['ok' => true]);
}

// Ограничение частоты по IP.
$ip = $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
$file = sys_get_temp_dir() . '/lead_rl_' . md5($ip) . '.json';
$now = time();
$hits = [];
if (is_readable($file)) {
    $prev = json_decode((string)file_get_contents($file), true);
    if (is_array($prev)) {
        $hits = array_values(array_filter($prev, static fn($t) => is_int($t) && $t > $now - RATE_WINDOW));
    }
}
if (count($hits) >= RATE_LIMIT) {
    respond(429, ['ok' => false, 'error' => 'rate_limited']);
}
$hits[] = $now;
@file_put_contents($file, json_encode($hits), LOCK_EX);

function clean($v, int $max = 200): string {
    if (!is_scalar($v)) return '';
    $s = trim((string)$v);
    $s = preg_replace('/\s+/u', ' ', $s) ?? '';
    if (function_exists('mb_substr')) $s = mb_substr($s, 0, $max);
    else $s = substr($s, 0, $max);
    return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function normalizePhone(string $raw): string {
    $d = preg_replace('/\D/', '', $raw) ?? '';
    if (strlen($d) === 11 && ($d[0] === '8' || $d[0] === '7')) $d = substr($d, 1);
    if (strlen($d) === 10) return '+7' . $d;
    return '';
}

$phone = normalizePhone((string)($data['phone'] ?? ''));
if ($phone === '') {
    respond(422, ['ok' => false, 'error' => 'invalid_phone']);
}

$type   = clean($data['type'] ?? 'Заявка с сайта', 60);
$pest   = clean($data['pest'] ?? '', 80);
$object = clean($data['object'] ?? '', 80);
$name   = clean($data['name'] ?? '', 60);
$org    = clean($data['org'] ?? '', 120);
$inn    = clean($data['inn'] ?? '', 12);
$source = clean($data['source'] ?? '', 200);
$price  = isset($data['priceFrom']) && is_numeric($data['priceFrom']) ? (int)$data['priceFrom'] : null;

$lines = ['<b>🔔 ' . $type . '</b>', ''];
if ($pest !== '')   $lines[] = 'Услуга: ' . $pest;
if ($object !== '') $lines[] = 'Объект: ' . $object;
if ($org !== '')    $lines[] = 'Организация: ' . $org;
if ($inn !== '')    $lines[] = 'ИНН: ' . $inn;
if ($name !== '')   $lines[] = 'Имя: ' . $name;
$lines[] = 'Телефон: <a href="tel:' . $phone . '">' . $phone . '</a>';
if ($price !== null && $price > 0) $lines[] = 'Расчётная цена: от ' . number_format($price, 0, ',', ' ') . ' ₽';
if ($source !== '') $lines[] = 'Страница: ' . $source;
$lines[] = 'Время: ' . date('d.m.Y H:i');

$token = getenv('TELEGRAM_BOT_TOKEN') ?: TELEGRAM_TOKEN_FALLBACK;
if ($token === '' || $token === 'ВСТАВЬТЕ_ТОКЕН_БОТА') {
    respond(500, ['ok' => false, 'error' => 'token_not_configured']);
}

$payload = http_build_query([
    'chat_id' => TELEGRAM_CHAT_ID,
    'text' => implode("\n", $lines),
    'parse_mode' => 'HTML',
    'disable_web_page_preview' => 'true',
]);

$ch = curl_init('https://api.telegram.org/bot' . $token . '/sendMessage');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => $payload,
    CURLOPT_TIMEOUT => 10,
]);
$response = curl_exec($ch);
$status = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status !== 200) {
    respond(502, ['ok' => false, 'error' => 'telegram_failed']);
}

respond(200, ['ok' => true]);