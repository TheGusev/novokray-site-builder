<?php
// DaData Suggestions прокси. Токен читается из public/api/config.php (не коммитить с реальным ключом).
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'method_not_allowed']);
    exit;
}

$cfgPath = __DIR__ . '/config.php';
if (!is_file($cfgPath)) {
    http_response_code(500);
    echo json_encode(['error' => 'config_missing']);
    exit;
}
require $cfgPath;

if (!defined('DADATA_TOKEN') || DADATA_TOKEN === '') {
    http_response_code(500);
    echo json_encode(['error' => 'token_missing']);
    exit;
}

$raw = file_get_contents('php://input');
$in = json_decode($raw ?: '{}', true);
$inn = isset($in['inn']) ? preg_replace('/\D/', '', (string)$in['inn']) : '';
if (!preg_match('/^\d{10}(\d{2})?$/', $inn)) {
    http_response_code(400);
    echo json_encode(['error' => 'bad_inn']);
    exit;
}

$ch = curl_init('https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_TIMEOUT => 8,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Token ' . DADATA_TOKEN,
    ],
    CURLOPT_POSTFIELDS => json_encode(['query' => $inn, 'count' => 1]),
]);
$resp = curl_exec($ch);
$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($resp === false || $code < 200 || $code >= 300) {
    http_response_code(502);
    echo json_encode(['error' => 'upstream_failed']);
    exit;
}

echo $resp;