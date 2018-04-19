<?php
# Includes the autoloader for libraries installed with composer
require_once (__DIR__ . '/vendor/autoload.php');
# Imports the Google Cloud client library
use Google\Cloud\Speech\SpeechClient;
putenv('GOOGLE_APPLICATION_CREDENTIALS=/var/www/html/My First Project-48a838adf88f.json');
# Your Google Cloud Platform project ID
$projectId = 'proud-shoreline-201223';
# Instantiates a client
$speech = new SpeechClient([
    'projectId' => $projectId,
    'languageCode' => 'en-US',
]);
# The name of the audio file to transcribe
$fileName = "myDir/test.wav";
# The audio file's encoding and sample rate
$options = [
    'encoding' => 'LINEAR16',
   'sampleRateHertz' => 16000,
];
# Detects speech in the audio file
$fp = fopen($fileName, 'r');
$results = $speech->recognize($fp, $options);
foreach ($results as $result) {
    echo $result->alternatives()[0]['transcript'];
}
?>
