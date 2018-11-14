// var express = require('express'),
//     http = require('http'),
//     path = require('path');
var fs=require('fs');
var bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    static = require('serve-static'),
    errorHandler = require('errorhandler');
var ejs=require("ejs");
var expressErrorHandler = require('express-error-handler');
var expressSession = require('express-session');

var multer = require('multer');
var mysql = require('mysql');

// var app = express();
// app.set('port', process.env.PORT || 3000);
// app.set('views',__dirname + '/views');
// app.set('view engine','ejs');
// app.use(bodyParser.urlencoded
//   ({
//     extended: false
// }));
//
// app.use(bodyParser.json());
// app.use('/public', static(path.join(__dirname, 'public')));
// app.use('/uploads', static(path.join(__dirname, 'uploads')));
// app.use(cookieParser());
// app.use(expressSession({
//     secret: 'my key',
//     resave: true,
//     saveUninitialized: true
// }));

var conn = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '9514560M',
  database : 'basketball'
});


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









var index = function(req, res){ // /login로 url을 접근할
  res.render('index');
}
module.exports.index=index;

var adduser = function(req,res){
   var name = req.params.name;
   var sql ='select * from users where name = ?'
   console.log(name);
   if(name){
   conn.query(sql,[name],function(err,result,fields){
     if(result.length === 0){
      res.render('adduser',{status:'아이디 사용가능'})
   }else{
     res.render('adduser',{status:'아이디 사용불가'})
   }
});
}else{
  res.render('adduser',{status:''})}
}


var board=function(req, res){ // 게시판화면에 접근
  fs.readFile('./public/board.html','utf8',function(error,data){
      conn.query('SELECT * FROM board',function(error , results){
          res.send(ejs.render(data,
          {data : results}))
      });
  });
}

var create=function(req, res){ //방만들기 화면에 접근
       fs.readFile('./public/createRoom.html','utf8',function(error,data){
        res.send(data);
});
}

var remove=function(req,res){ //삭제
    fs.readFile('./public/delete.html','utf8',function(error,data){
        conn.query('SELECT * FROM board WHERE count=?',[req.params.count],function(error, result){
            res.send(ejs.render(data,
            {data:result}))
        })

})
}

var edit=function(req,res){ //수정 페이지 받음 수정할 데이터를 함께받는다.
  fs.readFile('./public/delete.html','utf8',function(error,data){
      conn.query('SELECT * FROM board WHERE count=?',[req.params.count],function(error, result){
          res.send(ejs.render(data,
          {data:result}))
      })
    })
  }

var editor=function(req,res){
       fs.readFile('./public/editor.html','utf8',function(error,data){
                console.log("editor 파일 읽음");
               conn.query('SELECT * FROM board WHERE COUNT=?',[req.params.count],function(error,result){
               res.send(ejs.render(data,
               {data:result[0]}))
           });
       });
  }


var adduserPost= function (req, res) {
    var name = req.body.name;
    var password = req.body.password;
    var password_check = req.body.password_check;
    var gender = req.body.gender;
    var position = req.body.position;
    var quantity = req.body.quantity;
    var local = req.body.local;
    var level = req.body.level;
    var file;
    if (req.files.length === 0) {
        file = './uploads/user.png'
    } else {
        file = './uploads/' + req.files[0].originalname;
    }
     var sql ='select * from users where name = ?'
     conn.query(sql,[name],function(err,result,fields){
       if(result.length ===0){
         var sql = 'INSERT INTO  users (name,password,gender,position,quantity,local,level,file) VALUES(?,?,?,?,?,?,?,?);'
         conn.query(sql,[name,password,gender,position,quantity,local,level,file],function(err,result,fields){
           if(err){
             console.log("12341234");
             console.log(result[0].local)
             console.log(err);
             res.status(500).send('Internal Server Error');
           } else {
             console.dir(result);
             res.redirect('/')
           }
         });
       }else{
            console.log(err);
           res.status(500).send('아이디가 중복되었습니다.');
       }
});
};

var indexPost =function(req,res){
    conn.query('SELECT password from users WHERE name=?',[req.body.uname],function(err,result){
        console.log(result);
        if(result.length==0){
          res.redirect('/')
          return;}
        else{
          res.redirect('/board');
          // res.send("성공");
          return;
        }
    })
  }
var createPost=function(req, res){
    var body=req.body;
    conn.query('ALTER TABLE board AUTO_INCREMENT=1;'); //방을 삭제하고 새로운 방을 만들 때 그 숫자를 맞춰주기 위해서
    conn.query('INSERT INTO board (name, roomname, area, roomstate,time,password) VALUES (?,?,?,?,?,?)',[  // 데이터베이스에 삽입
        body.name,body.roomname,body.area,body.roomstate, body.time, body.password
    ],function(){
        res.redirect('/board'); //삽입된 화면을 다시 보여준다.
    })
    conn.query('SET @COUNT1=0;') // 번호가 12, 56 으로 되있는걸 정렬해줌
    conn.query('UPDATE board SET board.count = @COUNT1:=@COUNT1+1;')
} //방만들기에서 모든 내용을 입력하고

var removePost=function(req,res){
    var key=req.params.count;
    conn.query('SELECT * FROM board WHERE count=?',[req.params.count],function(error, result){
       if(req.body.pwcorrect==result[0].password){
    conn.query('DELETE FROM board WHERE count=?',[req.params.count],function(){
        res.redirect('/board');
        return;
     })
    }
       if(req.body.pwcorrect!=result[0].password){
        res.end("<script>alert('password error');location.href='/delete/"+key+"'</script>","utf8")
        }
      })
};

var editPost=function(req,res){  // 수정한 데이터를 입력 UPDATE 를 써서 데이터베이스에 저장
  var key=req.params.count;
  conn.query('SELECT * FROM board WHERE count=?',[req.params.count],function(error, result){
     console.log(result[0].password);
     console.log(req.body.pwcorrect);
     if(req.body.pwcorrect==result[0].password){
       res.end("<script>alert('password correct');location.href='/editor/"+key+"'</script>","utf8")
      return;
}
     if(req.body.pwcorrect!=result[0].password){
      res.end("<script>alert('password error');location.href='/edit/"+key+"'</script>","utf8")
      }
    })
  };

var editorPost=function(req,res){
         var body=req.body;
          conn.query('UPDATE board SET roomname=?,area=?, roomstate=?, password=?, time=? WHERE count=?',
          [body.roomname, body.area, body.roomstate, body.password,body.time, req.params.count],
          function(){
          res.redirect('/board')
          });
     }

var boardPost=function(req,res){ //검색기
    fs.readFile('./public/search.html','utf8',function(error,data){ //검색용 html
        if(req.body.rooms==undefined){
        conn.query('SELECT * FROM board WHERE (area=?) or (roomstate=?)',[req.body.search,req.body.rooms],function(error, results){ //지역이 같은 거의 내용들으 받아옴
            res.send(ejs.render(data,{data:results})) // 그걸 results 배열로 만들어서 보내준다.
        })}
        else if(req.body.rooms =="team_Create"){
        conn.query('SELECT * FROM board WHERE (area=?) or (roomstate=?)',[req.body.search,req.body.rooms],function(error, results){ //지역이 같은 거의 내용들으 받아옴
            res.send(ejs.render(data,{data:results})) // 그걸 results 배열로 만들어서 보내준다.
        })
    }
        else{
     conn.query('SELECT * FROM board WHERE (area=?) or (roomstate=?)',[req.body.search,req.body.rooms],function(error, results){ //지역이 같은 거의 내용들으 받아옴
            res.send(ejs.render(data,{data:results})) // 그걸 results 배열로 만들어서 보내준다.
        })
}
    })
}

module.exports.adduser=adduser;
module.exports.index=index;
module.exports.board=board;

module.exports.create=create;
module.exports.remove=remove;
module.exports.edit=edit;
module.exports.editor=editor;


module.exports.adduserPost=adduserPost;
module.exports.indexPost=indexPost;
module.exports.createPost=createPost;
module.exports.removePost=removePost;

module.exports.editPost=editPost;
module.exports.editorPost=editorPost;
module.exports.boardPost=boardPost;
