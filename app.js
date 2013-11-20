
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , profile = require('./routes/profile')
  , product = require('./routes/product')
  , step = require('./routes/step')
  , apps = require('./routes/apps')
  , tenant = require('./routes/tenant')
  , person = require('./routes/person')
  , consumer = require('./routes/consumer')
  , survey = require('./routes/survey')
  , provider = require('./routes/provider')
  , log = require('./routes/log')
  , video = require('./routes/video')
  , cat = require('./routes/cat')
  , fields = require('./routes/fields')
  , labels = require('./routes/labels')
  , http = require('http')
  , path = require('path')
  , fp = require('./routes/fup')
  , vp = require('./routes/vidup')
  , passport = require('passport')
  , auth = require('./routes/auth')
  , zip = require('./routes/zip')
  , segment = require('./routes/segment');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('jsonp callback', true );
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use('/profile/upload', fp.imgup);
//  app.use('/product/upload', produp.upload);
  app.use('/profile/vup', vp.vup);
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));

    //auth
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(auth.localStrategy);

    passport.serializeUser(auth.serializeUser);
    passport.deserializeUser(auth.deserializeUser);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/adm', routes.index);
app.get('/users', user.list);
app.post('/video/list', video.list);
app.get('/video/del', video.delete);
app.post('/video/total', video.total);
app.get('/video', video.listjp); //jsonp
app.post('/video/update', video.addVideo);
app.post('/cats/list', cat.list);
app.get('/cats/del', cat.delete);
app.post('/cats/total', cat.total);
app.post('/cats/update', cat.addCat);
app.get('/profile/loaddef', profile.loadprofiledef);
app.get('/profile/load', profile.loadprofile);
app.post('/profile/list', profile.loadprofiles);
app.post('/profile/update', profile.saveprofile);
//app.post('/profile/upload', profile.upload_file);
app.post('/product/list', product.list);
app.post('/product/qual', product.qual);
app.get('/product/del', product.delete);
app.post('/product/total', product.total);
app.post('/product/update', product.upsert);
app.get('/product/default', product.default);
app.post('/step/list', step.list);
app.post('/step/update', step.save);
app.post('/step/delete', step.delete);
app.post('/person/list', person.list);
app.post('/person/update', person.save);
app.post('/consumer/list', consumer.list);
app.post('/consumer/update', consumer.save);
app.post('/consumer/bytype', consumer.peopleByType);
app.post('/consumer/abandons', consumer.abandons)

app.post('/zip/list', zip.list);
app.post('/zip/update', zip.save);

app.post('/apps/list', apps.list);
app.post('/apps/update', apps.save);
app.post('/apps/delete', apps.delete);
app.post('/tenant/list', tenant.list);
app.post('/tenant/update', tenant.save);

app.post('/segment/list', segment.list);
app.post('/segment/update', segment.save);
app.post('/segment/delete', segment.delete);

app.post('/survey/list', survey.list);
app.post('/survey/update', survey.save);
app.post('/log/list', log.list);
app.post('/log/update', log.save);
app.post('/log/totalOrders', log.totalOrders);
app.post('/log/totalOrdersbyApp', log.totalOrdersByApp);
app.post('/log/statsByProvider', log.statsByProvider);
app.post('/log/convRate', log.convRate);
app.post('/log/callTime', log.callTime);
app.post('/log/totalRev', log.totalRev);
app.post('/provider/list', provider.list);
app.post('/provider/update', provider.save);
app.post('/fields/list', fields.list);
app.get('/fields/del', fields.delete);
app.post('/fields/total', fields.total);
app.post('/fields/update', fields.upsert);
app.get('/labels/list', labels.list);
app.get('/labels/del', labels.delete);
app.post('/labels/total', labels.total);
app.post('/labels/update', labels.upsert);
app.post('/auth/login', auth.login);
app.post('/auth/logout', auth.logout);
app.post('/auth/mayeye', auth.please);



var server = http.createServer(app);
var io = require('socket.io').listen(server);
server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

io.sockets.on('connection', function (socket) {
    socket.on('viewprod', function (data) {
        console.log('Called viewprod');
        console.log(data);
        socket.broadcast.emit('prodviewed', data);
    });
});