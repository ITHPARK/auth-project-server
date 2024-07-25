//express 서버 생성
const express = require('express');

//MongoDB 라이브러리  
const mongoose = require('mongoose');

//CORS는 웹 애플리케이션이 다른 도메인, 포트, 프로토콜에서 리소스를 요청 허용
const cors = require('cors');

const usersRouter = require('./routes/users.router');

const PORT = 4000;


// const authRoutes = require('./routes/auth');


//Express.js 애플리케이션을 생성하고 구성하는 객체
const app = express();

// 모든 도메인에서의 요청을 허용
app.use(cors({
    origin: true, // 또는 'http://localhost:8801' 등 허용할 출처를 명시
    credentials: true // 자격 증명 정보 포함 허용
  }));

//JSON 형식의 요청 본문을 파싱하는 미들웨어
//JSON 데이터를 JavaScript 객체로 변환
app.use(express.json());



//몽고디비 연결
mongoose.connect(`mongodb+srv://ithpark:12341234@auth-app.lqr2meh.mongodb.net/?retryWrites=true&w=majority&appName=auth-app`)
    .then(() => console.log('monggodb connected'))
    .catch(err => console.log(err));

    //라우터 설정
app.use('/users', usersRouter);


app.use((req, res, next) => {
    const start = Date.now();
    console.log(`${req.method} ${req.url}`);

    // 다음 미들웨어로 제어를 넘김
    next();

    // 미들웨어를 거쳐갔다가 돌아오는 시간 측정
    const diffTime = Date.now() - start;
    console.log(`End: ${req.method} ${req.baseUrl}${req.url} ${diffTime}ms`);
});


//에러처리 미들웨어 (이걸 사용하지 않으면 에러발생 동시에 서버가 내려간다.)
app.use((error, req, res, next) => {
    res.json({message: error.message});
})
    


//서버 시작
app.listen(PORT,() => {
    console.log(`server listening on ${PORT}`);
})









