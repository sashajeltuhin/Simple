cd ../
if [ -d $1 ]; then
echo $2 exists... removing
find $2 -name "* .*" -print0 | xargs -0 rm -rf
fi
#create dir
echo creating $2
mkdir $2

echo copying files
cp -fv simple/16x16.png $2/16x16.png
cp -fv simple/tenants/$1/$3 $2/$3
cp -fv simple/tenants/$1/manifest.json $2/manifest.json
cp -rfv simple/tenants/$1/assets $2/assets
cp -rfv simple/ctrl $2/ctrl
cp -rfv simple/dir $2/dir
cp -rfv simple/css $2/css
cp -rfv simple/js $2/js
cp -rfv simple/mods $2/mods
cp -rfv simple/service $2/service
cp -rfv simple/tenants/$1 $2/templ

cd $2
sed -i '' "s/localhost/$4/g" *.js
cd mods
sed -i '' "s/localhost/$4/g" *.js
cd ../templ
sed -i '' "s/localhost/$4/g" *.html
#cd ../assets/css
#sed -i '' "s/localhost/$4/g" *.css

#/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --pack-extension=/users/sashajeltuhin/webstormprojects/amazonExt --pack-extension-key=/users/sashajeltuhin/webstormprojects/amazonExt.pem

#ssh -t sjeltuhin@simple.bridgevine.com "sudo bash /home/sjeltuhin/deploy/deployExt.sh"
#usage: deployExt Amazon amazonExt amazinjector.js 'server name

