SRC_DIR = src
BUILD_DIR = build

PREFIX = .
DIST_DIR = ${PREFIX}/dist

IG_VER = $(shell cat version.txt)

DATE=$(shell date)


BASE_FILES = ${SRC_DIR}/TTemplate.js\
	${SRC_DIR}/Exception.js\
	${SRC_DIR}/Data.js\
	${SRC_DIR}/Template.js\
	${SRC_DIR}/VirtualTemplate.js\
	${SRC_DIR}/Reader.js\
	${SRC_DIR}/functions.js\
	${SRC_DIR}/modifiers.js\
	${SRC_DIR}/control.capture.js\
	${SRC_DIR}/control.for.js\
	${SRC_DIR}/control.foreach.js\
	${SRC_DIR}/control.if.js\
	${SRC_DIR}/control.section.js\
	${SRC_DIR}/control.template.js

BUILD_FILES = ${SRC_DIR}/intro.js\
	${BASE_FILES}\
	${SRC_DIR}/browser.js\
	${SRC_DIR}/outro.js


FILE_BUILD = ${DIST_DIR}/TTemplate.js
FILE_MIN = ${DIST_DIR}/TTemplate.min.js

all: build
	@@echo "TTemplate build complete"


${DIST_DIR}:
	@@mkdir -p ${DIST_DIR};


build: ${DIST_DIR}
	@@echo "Building..."

	@@cat ${BUILD_FILES} | \
		sed 's/.function.TT..{//' | \
		sed 's/}.TT..;//' | \
		sed 's/@DATE/'"${DATE}"'/' | \
		sed 's/@VERSION/${IG_VER}/' > ${FILE_BUILD};


clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}


.PHONY: all build clean