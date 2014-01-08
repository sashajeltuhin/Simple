
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , profile = require('./routes/profile')
  , product = require('./routes/product')
  , step = require('./routes/step')
  , block = require('./routes/block')
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
  , tmplUp = require('./routes/templateUp')
  , imgUp = require('./routes/imgUp')
  , fileUp = require('./routes/fileUp')
  , passport = require('passport')
  , auth = require('./routes/auth')
  , zip = require('./routes/zip')
  , segment = require('./routes/segment')
  , rule = require('./routes/rule')
  , csvtool = require('./routes/csvtool')
  , draft = require('./routes/draft');

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
  app.use('/step/template', tmplUp.upload);
  app.use('/image/upload', imgUp.upload);
  app.use('/file/upload', fileUp.upload);
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
app.post('/product/delete', product.delete);
app.post('/product/total', product.total);
app.post('/product/update', product.upsert);
app.post('/product/import', product.import);
app.post('/product/export', product.export);
app.get('/product/default', product.default);
app.post('/product/columnMap', product.detectCols);

app.post('/step/list', step.list);
app.post('/step/update', step.save);
app.post('/step/delete', step.delete);
app.post('/block/list', block.list);
app.post('/block/update', block.save);
app.post('/block/delete', block.delete);

app.post('/draft/list', draft.list);
app.post('/draft/update', draft.save);
app.post('/draft/delete', draft.delete);
app.post('/draft/publish', draft.publish);

app.post('/person/list', person.list);
app.post('/person/update', person.save);
app.post('/consumer/list', consumer.list);
app.post('/consumer/update', consumer.save);
app.post('/product/export', consumer.export);
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

app.post('/rule/list', rule.list);
app.post('/rule/update', rule.save);
app.post('/rule/delete', rule.delete);


app.post('/survey/list', survey.list);
app.post('/survey/update', survey.save);
app.post('/survey/delete', survey.delete);
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
app.post('/fields/delete', fields.delete);
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

var clients = {};
io.sockets.on('connection', function (socket) {
    clients[socket.id] = socket;
    socket.on('disconnect', function() {
        console.log('Got disconnect!');
        delete clients['socket.id'];
    });
    socket.on('viewprod', function (data) {
        console.log('Called viewprod');
        console.log(data);
        socket.broadcast.emit('prodviewed', data);
    });

    socket.on('agenttalk', function (action) {
        console.log('Called agenttalk with ID = ' + socket.id);
        console.log(action);
        logChatAction(action, socket.id, 'agenttalk');
        socket.broadcast.emit('agenttalk', action);
    });

    socket.on('feedback', function (feed) {
        console.log('Client feedback with ID:' + socket.id);
        console.log(feed);
        logChatAction(feed, socket.id, 'feedback');
        socket.broadcast.emit('feedback', feed);
    });
});

function logChatAction(action, id, ev){
    var a = {};
    a.action = ev;
    a.time = new Date();
    a.app = action.app;
    a.data = {};
    a.data.aid = id;
    a.data.event = action.name;
    log.log(a);
}