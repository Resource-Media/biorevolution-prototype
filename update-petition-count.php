<?php
$petitionId = '767417';
$sourceUrl = "https://petition.parliament.uk/petitions/$petitionId.json";
$outputFile = __DIR__ . '/petition-count.json';

$json = @file_get_contents($sourceUrl);

if ($json === false) {
    exit("Failed to fetch petition JSON\n");
}

$data = json_decode($json, true);

if (!is_array($data) || !isset($data['data']['attributes']['signature_count'])) {
    exit("Invalid JSON structure\n");
}

$out = [
    'signature_count' => (int)$data['data']['attributes']['signature_count']
];

$tmp = $outputFile . '.tmp';
if (file_put_contents($tmp, json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)) === false) {
    exit("Failed to write temp file\n");
}
if (!rename($tmp, $outputFile)) {
    @unlink($tmp);
    exit("Failed to rename temp file\n");
}