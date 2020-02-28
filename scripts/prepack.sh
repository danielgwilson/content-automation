rm -rf lib
mkdir lib
cp -r resources/ lib/resources
tsc -b
oclif-dev manifest
oclif-dev readme