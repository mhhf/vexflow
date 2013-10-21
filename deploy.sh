#!/bin/sh
./build.sh

FILE_ORIGINAL='build/vexflow/vexflow-min-pre.js'
FILE='build/vexflow/vexflow-min.js'

VEXFLOW_BACKEND='/Users/mhhf/flowky/code/backend/client/logik/libs/vexflow-min.js'
VEXFLOW_FRONTEND='/Users/mhhf/flowky/code/flowky-prototyp/client/logic/player/lib/vexflow-min.js'
VEXFLOW_SYNC='/Users/mhhf/flowky/code/sync/public/js/lib/vexflow-min.js'

while getopts ':bfsn:' OPTION ; do
	case "$OPTION" in
		b)   echo "Deploye zum Backend"
			cp $FILE $VEXFLOW_BACKEND
			;;
		f)   echo "Deploye zum Frontend"
			cp $FILE $VEXFLOW_FRONTEND
			;;
		s)   echo "Deploye zur Sync"
			cp $FILE_ORIGINAL $VEXFLOW_SYNC
			;;
		*)   echo "Unbekannter Parameter $OPTION"
	esac
done
