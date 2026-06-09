<?php
$host = "db";
$user = "app";
$pass = "apppass";
$dbname = "mercashop";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
