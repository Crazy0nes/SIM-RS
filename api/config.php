<?php
// Izinkan akses dari origin React (misal, localhost:5173)

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

$host = 'localhost';
$user = 'root';
$pass = ''; 
$db   = 'rbpl_rs';

mysqli_report(MYSQLI_REPORT_OFF); // Matikan error fatal default (PHP 8.1+)
$conn = @new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Koneksi database gagal atau database tidak ditemukan. Cek db: ' . $db
    ]);
    exit();
}

// Set header ke JSON untuk API
header('Content-Type: application/json');
?>
