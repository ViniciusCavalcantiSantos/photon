<?php

return [
    'collection_id' => env('REKOGNITION_COLLECTION_ID', 'photon-faces'),
    'use_s3_object' => env('REKOGNITION_USE_S3_OBJECT', false),
    'disk' => env('REKOGNITION_DISK', config('filesystems.default')),
    'bucket' => env('REKOGNITION_BUCKET', config('filesystems.disks.s3.bucket')),
    'region' => env('REKOGNITION_REGION', config('filesystems.disks.s3.region')),
    'key' => env('REKOGNITION_KEY', config('filesystems.disks.s3.key')),
    'secret' => env('REKOGNITION_SECRET', config('filesystems.disks.s3.secret'))
];