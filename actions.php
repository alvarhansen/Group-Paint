<?php
include_once 'config.php';

function connect(){
	global $server, $username, $password, $database_name;
	
	$connection = mysql_connect( $server, $username, $password );
	if (!$connection) {
		die('Could not connect: ' . mysql_error());
	}
	mysql_select_db( $database_name, $connection );
	if ( !mysql_select_db( $database_name, $connection ) ){
	die('Not connected : ' . mysql_error());
	}
	mysql_query("SET NAMES 'utf8'");
	mysql_query("SET CHARACTER SET 'utf8'");
}

function add_object( $type_id, $owner, $time = -1, $line_width = 1, $color = '#000' ){
	$type_id = (int)$type_id;
	$owner = mysql_real_escape_string( $owner );
	$time = ( (int)$time ) == -1 ? time(): (int)$time;
	$line_width = (int)$line_width;
	$color = mysql_real_escape_string( $color );
	
	$table_name = 'objects';
	$query = "INSERT INTO $table_name ( type_id, owner, time, line_width, color ) values( $type_id, '$owner', $time, $line_width, '$color' )";
	$response = mysql_query( $query );
	if( $response ){
		$object_id = mysql_insert_id( );
		return $object_id;
	}else{
		return mysql_error();
	}
}

function add_drawing( $object_id, $x, $y ){
	$object_id = (int)$object_id;
	$x = (int)$x;
	$y = (int)$y;
	
	$table_name = 'drawings';
	$query = "INSERT INTO $table_name ( object_id, x, y ) values( $object_id, $x, $y )";
	$response = mysql_query( $query);
	if( $response ){
		$drawing_id = mysql_insert_id();
		return $drawing_id;
	}else{
		return mysql_error();
	}
}

function get_all_objects($starting_obj_id){
	$starting_obj_id = (int)$starting_obj_id;
	$objects = array();
	$objects_table_name = 'objects';

	$query = "SELECT $objects_table_name.id, $objects_table_name.type_id, $objects_table_name.owner,
					$objects_table_name.time, $objects_table_name.line_width, $objects_table_name.color
					FROM $objects_table_name
					WHERE $objects_table_name.id > $starting_obj_id";
	//echo $query;
	$result = mysql_query( $query);
	if( !$result || mysql_num_rows( $result ) == 0 ){ return array(); }
	while( $row = mysql_fetch_row( $result ) ){
		 $object = array();
		 $object['id'] = $row[0];
		 $object['type_id'] = $row[1];
		 $object['owner'] = $row[2];
		 $object['time'] = $row[3];
		 $object['line_width'] = $row[4];
		 $object['color'] = $row[5];
		 array_push( $objects, $object );
	}
	return $objects;
}
function get_all_points( $object_id ){
	$drawings = array();
	$drawings_table_name = 'drawings';

	$query = "SELECT $drawings_table_name.id, $drawings_table_name.object_id, $drawings_table_name.x, $drawings_table_name.y
					FROM $drawings_table_name
					WHERE $drawings_table_name.object_id = $object_id
					ORDER BY $drawings_table_name.id";
	//echo $query;
	$result = mysql_query( $query );
	if( !$result || mysql_num_rows( $result ) == 0 ){ return array(); }
	while( $row = mysql_fetch_row( $result ) ){
		 $drawing = array();
		 $drawing['id'] = $row[0];
		 $drawing['object_id'] = $row[1];
		 $drawing['x'] = $row[2];
		 $drawing['y'] = $row[3];
		 array_push( $drawings, $drawing );
	}
	return $drawings;
}

function clear_points(){
	$id = (int)$id;
	$table_name = 'objects';

	$query = "DELETE FROM $table_name";
	$response = mysql_query( $query );
	if( $response ){
		 return $response;
	}else{
		 return mysql_error( );
	}
}

function clear_objects(){
	$id = (int)$id;
	$table_name = 'drawings';

	$query = "DELETE FROM $table_name";
	$response = mysql_query( $query );
	if( $response ){
		 return $response;
	}else{
		 return mysql_error();
	}
}

function get_all_json( $starting_obj_id ){
	$starting_obj_id = (int)$starting_obj_id;
	$objects = get_all_objects($starting_obj_id);
	$json_array = array('objects' => array() );
	for( $i = 0; $i < count( $objects ); $i++ ){
		$object = array( 	'id' => $objects[$i]['id'], 
								'type_id'  => $objects[$i]['type_id'], 
								'owner'  => $objects[$i]['owner'], 
								'line_width'  => $objects[$i]['line_width'], 
								'color'  => $objects[$i]['color'], 
								'points' => array() );
								
		$points = get_all_points( $objects[$i]['id'] );
		//echo '<pre>';
		//echo count( $points );
		//print_r( $points );
		//echo '</pre>';
		for( $ii = 0; $ii < count( $points ); $ii++ ){
			array_push( $object['points'], array( 'x' => $points[$ii]['x'], 'y' => $points[$ii]['y'] ) );
		}
								
		array_push( $json_array['objects'], $object);
	}
	
	return json_encode( $json_array );
}

if( isset( $_REQUEST['action'] ) ){
	$action = $_REQUEST['action'];
	connect();
	if( $action == 'add' ){
		$type = (int)$_POST['type'];
		$owner = 'asd';
		$time = time();
		$line_width = (int)$_POST['line_width'];
		$color = $_POST['color'];
		$object_id = add_object( $type, $owner, $time, $line_width, $color );
		$points = $_REQUEST['p'];
		//echo 'points: ';
		//print_r( $points );
		for( $i = 0; $i < count( $points ); $i++ ){
			add_drawing( $object_id, $points[$i]['x'], $points[$i]['y'] );
		}
	}elseif( $action == 'get_all' ){
		header("Content-Type: application/json;charset=UTF-8");
		echo get_all_json( $_REQUEST['start'] );
	}elseif( $action == 'clear_all' ){
		clear_objects();
		clear_points();
		$type = 0;
		$owner = 'asd';
		add_object( $type, $owner );
		echo get_all_json( 0 );
	}
}

?>