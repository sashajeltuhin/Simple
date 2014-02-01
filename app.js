
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
  , draft = require('./routes/draft')
  , note = require('./routes/note')
  , action = require('./routes/action')
  , db = require('./db/dbaccess')
  , session = require('./routes/adminsession');

var app = express();

app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('jsonp callback', true );
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use('/profile/upload', fp.imgup);
    app.use('/profile/vup', vp.vup);
    app.use('/app/upload/template', tmplUp.upload);
    app.use('/app/upload/image', imgUp.upload);
    app.use('/app/upload/file', fileUp.upload);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    //auth
    passport.use(auth.localStrategy);
    passport.serializeUser(auth.serializeUser);
    passport.deserializeUser(auth.deserializeUser);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/adm', routes.index);
app.post('/app/user/list', user.list);
app.post('/app/user/update', user.save);
app.post('/app/user/delete', user.delete);

app.post('/app/session/list', session.list);
app.post('/app/session/update', session.save);
app.post('/app/session/delete', session.delete);

app.post('/app/note/list', note.list);
app.post('/app/note/update', note.save);
app.post('/app/note/delete', note.delete);

app.post('/app/action/list', action.list);
app.post('/app/action/update', action.save);
app.post('/app/action/delete', action.delete);


app.post('/app/report/total', db.total);
app.post('/app/report/calc', db.compute);


app.post('/app/video/list', video.list);
app.get('/app/video/del', video.delete);
app.post('/app/video/total', video.total);
app.get('/app/video', video.listjp); //jsonp
app.post('/app/video/update', video.addVideo);
app.post('/app/cats/list', cat.list);
app.get('/app/cats/del', cat.delete);
app.post('/app/cats/total', cat.total);
app.post('/app/cats/update', cat.addCat);
app.get('/app/profile/loaddef', profile.loadprofiledef);
app.get('/app/profile/load', profile.loadprofile);
app.post('/app/profile/list', profile.loadprofiles);
app.post('/app/profile/update', profile.saveprofile);
//app.post('/profile/upload', profile.upload_file);
app.post('/app/product/list', product.list);
app.post('/app/product/qual', product.qual);
app.post('/app/product/delete', product.delete);
app.post('/app/product/total', product.total);
app.post('/app/product/update', product.upsert);
app.post('/app/product/import', product.import);
app.post('/app/product/export', product.export);
app.get('/app/product/default', product.default);
app.post('/app/product/columnMap', product.detectCols);

app.post('/app/step/list', step.list);
app.post('/app/step/update', step.save);
app.post('/app/step/delete', step.delete);
app.post('/app/block/list', block.list);
app.post('/app/block/update', block.save);
app.post('/app/block/delete', block.delete);

app.post('/app/draft/list', draft.list);
app.post('/app/draft/update', draft.save);
app.post('/app/draft/delete', draft.delete);
app.post('/app/draft/publish', draft.publish);

app.post('/app/person/list', person.list);
app.post('/app/person/update', person.save);
app.post('/app/person/delete', person.delete);
app.post('/app/consumer/list', consumer.list);
app.post('/app/consumer/update', consumer.save);
app.post('/app/product/export', consumer.export);
app.post('/app/consumer/bytype', consumer.peopleByType);
app.post('/app/consumer/abandons', consumer.abandons)

app.post('/app/zip/list', zip.list);
app.post('/app/zip/update', zip.save);

app.post('/app/apps/list', apps.list);
app.post('/app/apps/update', apps.save);
app.post('/app/apps/delete', apps.delete);
app.post('/app/tenant/list', tenant.list);
app.post('/app/tenant/update', tenant.save);

app.post('/app/segment/list', segment.list);
app.post('/app/segment/update', segment.save);
app.post('/app/segment/delete', segment.delete);

app.post('/app/rule/list', rule.list);
app.post('/app/rule/update', rule.save);
app.post('/app/rule/delete', rule.delete);


app.post('/app/survey/list', survey.list);
app.post('/app/survey/update', survey.save);
app.post('/app/survey/delete', survey.delete);
app.post('/app/log/list', log.list);
app.post('/app/log/update', log.save);
app.post('/app/log/totalOrders', log.totalOrders);
app.post('/app/log/totalOrdersbyApp', log.totalOrdersByApp);
app.post('/app/log/statsByProvider', log.statsByProvider);
app.post('/app/log/convRate', log.convRate);
app.post('/app/log/callTime', log.callTime);
app.post('/app/log/totalRev', log.totalRev);
app.post('/app/provider/list', provider.list);
app.post('/app/provider/update', provider.save);
app.post('/app/fields/list', fields.list);
app.post('/app/fields/delete', fields.delete);
app.post('/app/fields/total', fields.total);
app.post('/app/fields/update', fields.upsert);
app.get('/app/labels/list', labels.list);
app.get('/app/labels/del', labels.delete);
app.post('/app/labels/total', labels.total);
app.post('/app/labels/update', labels.upsert);
app.post('/app/auth/login', auth.login);
app.post('/app/auth/logout', auth.logout);
app.post('/app/auth/mayeye', auth.please);
app.post('/app/auth/there', auth.checkSession);



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