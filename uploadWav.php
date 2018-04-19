<?php
 $dir = 'myDir';

 // create new directory with 744 permissions if it does not exist yet
 // owner will be the user/group the PHP script is run under
 if ( !file_exists($dir) ) {
     $oldmask = umask(0);  // helpful when used in linux server  
     mkdir ($dir, 0755);
 }

// pull the raw binary data from the POST array
$data = substr($_POST['data'], strpos($_POST['data'], ",") + 1);
// decode it
$decodedData = base64_decode($data);
// print out the raw data, 
echo "send\n";
$filename = $_POST['fname'];
// write the data out to the file
$fp = fopen($dir.'/'.$filename, 'wb');
fwrite($fp, $decodedData);
fclose($fp);


?> 
