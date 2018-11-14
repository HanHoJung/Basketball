var express = require('express'),
    http = require('http'),
    path = require('path');

 var bodyParser = require('body-parser'),
     cookieParser = require('cookie-parser'),
     static = require('serve-static'),
     errorHandler = require('errorhandler');
// var ejs=require("ejs");
 var expressErrorHandler = require('express-error-handler');
 var expressSession = require('express-session');

 var multer = require('multer');
// var mysql = require('mysql');
 var rt=require('./routes/users');
var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views',__dirname + '/views');
app.set('view engine','ejs');
app.use(bodyParser.urlencoded
  ({
    extended: false
}));

app.use(bodyParser.json());
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));
app.use(cookieParser());
app.use(expressSession({
    secret: 'my key',
    resave: true,
    saveUninitialized: true
}));

// var conn = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '9514560m',
//   database : 'basketball'
// });


var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'uploads')
    },
    filename: function (req, file, callback) {
        var extension = path.extname(file.originalname);
        var basename = path.basename(file.originalname, extension);

        callback(null, basename + extension);
    }
});


var upload = multer({
    storage: storage,
    limits: {
        files: 50,
        fileSize: 1024 * 1024 * 1024
    }
});



//setting
// -----------------------------------------------------------------------------
//get start
app.get(['/process/adduser','/process/adduser/:name'],rt.adduser)


 app.get('/',rt.index);

 app.get('/board',rt.board);

// app.post('/board',function(req,res){ //검색기
//     fs.readFile('./public/search.html','utf8',function(error,data){ //검색용 html
//         if(req.body.rooms==undefined){
//         conn.query('SELECT * FROM board WHERE (area=?) or (roomstate=?)',[req.body.search,req.body.rooms],function(error, results){ //지역이 같은 거의 내용들으 받아옴
//             res.send(ejs.render(data,{data:results})) // 그걸 results 배열로 만들어서 보내준다.
//         })}
//         else if(req.body.rooms =="team_Create"){
//         conn.query('SELECT * FROM board WHERE (area=?) or (roomstate=?)',[req.body.search,req.body.rooms],function(error, results){ //지역이 같은 거의 내용들으 받아옴
//             res.send(ejs.render(data,{data:results})) // 그걸 results 배열로 만들어서 보내준다.
//         })
//     }
//         else{
//      conn.query('SELECT * FROM board WHERE (area=?) or (roomstate=?)',[req.body.search,req.body.rooms],function(error, results){ //지역이 같은 거의 내용들으 받아옴
//             res.send(ejs.render(data,{data:results})) // 그걸 results 배열로 만들어서 보내준다.
//         })
// }
//     })
// })

app.get('/createRoom',rt.create);

// app.post('/createRoom',function(req, res){
//     var body=req.body;
//     conn.query('ALTER TABLE board AUTO_INCREMENT=1;'); //방을 삭제하고 새로운 방을 만들 때 그 숫자를 맞춰주기 위해서
//     conn.query('INSERT INTO board (name, roomname, area, roomstate,time,password) VALUES (?,?,?,?,?,?)',[  // 데이터베이스에 삽입
//         body.name,body.roomname,body.area,body.roomstate, body.time, body.password
//     ],function(){
//         res.redirect('/board'); //삽입된 화면을 다시 보여준다.
//     })
//     conn.query('SET @COUNT1=0;') // 번호가 12, 56 으로 되있는걸 정렬해줌
//     conn.query('UPDATE board SET board.count = @COUNT1:=@COUNT1+1;')
// }) //방만들기에서 모든 내용을 입력하고


app.get('/delete/:count',rt.remove)
// app.post('/delete/:count',function(req,res){
//     var key=req.params.count;
//     conn.query('SELECT * FROM board WHERE count=?',[req.params.count],function(error, result){
//        if(req.body.pwcorrect==result[0].password){
//     conn.query('DELETE FROM board WHERE count=?',[req.params.count],function(){
//         res.redirect('/board');
//         return;
//      })
//     }
//        if(req.body.pwcorrect!=result[0].password){
//         res.end("<script>alert('password error');location.href='/delete/"+key+"'</script>","utf8")
//         }
//       })
// });



 app.get('/edit/:count',rt.edit);
//  app.post('/edit/:count',function(req,res){  // 수정한 데이터를 입력 UPDATE 를 써서 데이터베이스에 저장
//    var key=req.params.count;
//    conn.query('SELECT * FROM board WHERE count=?',[req.params.count],function(error, result){
//       console.log(result[0].password);
//       console.log(req.body.pwcorrect);
//       if(req.body.pwcorrect==result[0].password){
//         res.end("<script>alert('password correct');location.href='/editor/"+key+"'</script>","utf8")
//        return;
// }
//       if(req.body.pwcorrect!=result[0].password){
//        res.end("<script>alert('password error');location.href='/edit/"+key+"'</script>","utf8")
//        }
//      })
//    });
//
app.get('/editor/:count',rt.editor);


// app.post('/editor/:count',function(req,res){
//        var body=req.body;
//         conn.query('UPDATE board SET roomname=?,area=?, time=? WHERE count=?',
//         [body.roomname, body.area, body.time, req.params.count],
//         function(){
//         res.redirect('/board')
//         });
//    });
app.post('/process/adduser',upload.array('photo', 1),rt.adduserPost);
app.post('/process',rt.indexPost);
app.post('/createRoom',rt.createPost);
app.post('/delete/:count',rt.removePost);
app.post('/edit/:count', rt.editPost);
app.post('/editor/:count',rt.editorPost);
app.post('/board',rt.boardPost);


var errorHandler = expressErrorHandler({
    static: {
        '404': './public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);



http.createServer(app).listen(app.get('port'), function () {
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
});
