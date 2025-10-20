<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // 24 hours
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'GET') {

    // --- MySQL Connection Details ---
    include 'config.php';
    
    // --- Create and Check MySQL Connection ---
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check for connection errors
    if ($conn->connect_error) {
        // Stop execution and report the error
        die(json_encode(array("error" => "Connection failed: " . $conn->connect_error)));
    }

    // Set character set to utf8
    $conn->set_charset("utf8");

    // --- Fetch Members ---
    $sql_members = "SELECT id, name, linkedin FROM tb_member WHERE active = 1 ORDER BY name";
    $result_members = $conn->query($sql_members);
    $node_members = array();
    // Use fetch_assoc() to get an associative array
    while ($row = $result_members->fetch_assoc()) {
        $node_members[] = $row;
    }

    // --- Fetch Organizations ---
    $sql_orgs = "SELECT * FROM tb_organization ORDER BY label";
    $result_orgs = $conn->query($sql_orgs);
    $node_organizations = array();
    $edge_organizations_types = array();
    while ($row = $result_orgs->fetch_assoc()) {
        // Add to organizations node list
        $node_organizations[] = array(
            "id" => $row['id'],
            "label" => $row['label'],
			"url" => $row['url'],
			"title" => $row['title'],
        );
        // Add to organization-type edge list
        $edge_organizations_types[] = array(
            "organization_id" => $row['id'],
            "organization_type_id" => $row['type_id'],
        );
    }

    // --- Fetch Organization Types ---
    $sql_org_types = "SELECT id, label, title FROM tb_organization_type";
    $result_org_types = $conn->query($sql_org_types);
    $node_organization_types = array();
    while ($row = $result_org_types->fetch_assoc()) {
        $node_organization_types[] = $row;
    }

    // --- Fetch Members-Organizations Relationships ---
    $sql_mem_orgs = "SELECT member_id, organization_id FROM tb_member_organization";
    $result_mem_orgs = $conn->query($sql_mem_orgs);
    $edge_members_organizations = array();
    while ($row = $result_mem_orgs->fetch_assoc()) {
        $edge_members_organizations[] = $row;
    }

    // --- Encode and Output JSON ---
    echo json_encode(array(
        "node_members" => $node_members,
        "node_organizations" => $node_organizations,
        "node_organization_types" => $node_organization_types,
        "edge_members_organizations" => $edge_members_organizations,
        "edge_organizations_types" => $edge_organizations_types,
    ));

    // --- Close MySQL Connection ---
    $conn->close();
}
?>