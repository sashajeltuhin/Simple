cd ../
if [ -d $1 ]; then
echo $1 exists... removing
find $1 -name "* .*" -print0 | xargs -0 rm -rf
fi
#create dir
echo creating $1
mkdir $1

echo copying files
cp -fv simple/16x16.png $1/16x16.png
cp -fv simple/$2 $1/$2
cp -fv simple/$3 $1/manifest.json
cp -rfv simple/assets $1/assets
cp -rfv simple/ctrl $1/ctrl
cp -rfv simple/dir $1/dir
cp -rfv simple/css $1/css
cp -rfv simple/js $1/js
cp -rfv simple/mods $1/mods
cp -rfv simple/service $1/service
cp -rfv simple/templ $1/templ

#cd $1
#sed -i '' "s/localhost/$4/g" *.js
#cd mods
#sed -i '' "s/localhost/$4/g" *.js
#cd ../templ
#sed -i '' "s/localhost/$4/g" *.html

