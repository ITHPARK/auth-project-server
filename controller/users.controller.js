//.env 파일에 정의된 환경 변수를 로드하기 위해 사용하는 패키지
require('dotenv').config();
const jwt = require('jsonwebtoken');
const usersModel = require('../models/users.model');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const refreshTokens = new Map();


//req, res, next = express 표준 매개변수 (next = 다음 미들웨어 함수를 호출)
async function createUser(req, res, next) {
    try {
        //클라이언트에서 사용자 이름, 이메일, 비밀번호 등의 정보를 req.body에 담아 서버로 전송
        const createUser = await usersModel.create(req.body);

        //성공적으로 사용자가 생성되면 HTTP 상태 코드 201(Created)을 설정
        res.status(201).json(createUser);
    }catch (error) {
        next(error);
    }
}

async function getUserById(req, res, next) {
    try {
        const userId = req.params.userId;

        // 요청한 사용자와 조회하려는 사용자가 다를 경우 권한 없음
        if (req.user.userid !== userId) {
            return res.status(403).json({ message: "권한이 없습니다." });
        }

        const user = await usersModel.findOne({ userid: userId }).select('-password');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
        }
    } catch (error) {
        next(error);
    }
}

//삭제
async function deleteUser(req, res, next) {
    try{
        //findOneAndDelete로 db 유저정보의 userid를 찾는다. (객체 기반의 조건 검색)
        let deletedUser = await usersModel.findOneAndDelete({ userid: req.params.userId });
        if(deletedUser) {
            res.status(200).json(deletedUser);
        }else {
            res.status(404).send();
        }
    }catch (error){
        next(error);
    }
}

//로그인체크할 함수
async function loginCheck(req, res, next) {
    try {
        const { userid, password,  } = req.body;

        // db에서 사용자 검색
        const user = await usersModel.findOne({ userid });

        if (!user) {
            return res.status(404).json({ message: "일치하는 아이디가 없습니다." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        // 비밀번호 비교
        if (!isMatch) {
            return res.status(401).json({ message: '비밀번호가 틀렸습니다.' });
        }

        
        // JWT(json web token) 토큰 생성 
        /*
            sign 메서드 구조 
            jwt.sign(payload, secretOrPrivateKey, [options, callback])
            payload: 토큰에 포함될 데이터를 의미
            secretOrPrivateKey: 토큰을 암호화하고 서명하는 데 사용되는 시크릿 키 또는 개인 키
            options : 토큰의 설정을 정의하는 객체. expiresIn, audience, issuer, subject 등이 있다.
        */

        // 32바이트의 무작위 비밀 키 생성
        /*
           crypto: 암호화와 관련된 다양한 기능을 제공
           randomBytes: 무작위 바이너리 데이터를 생성 (32)면 32바이트(256비트)
           toString: 문자열로 변환. (hex = 16진수)
        */
        // const secretKey = crypto.randomBytes(32).toString('hex');
        const secretKey = process.env.JWT_SECRET_KEY;

        //사용자 정보를 payload로 설정하여 JWT 생성
        const payload = {
            userid: userid,
          };
     

        // JWT 토큰 생성
        const accessToken = jwt.sign(payload, secretKey, { expiresIn: '10s' });

        const refreshToken = jwt.sign(payload, secretKey, { expiresIn: '1d' });


        //map 객체에 할당 파라미터(키, 값)
        refreshTokens.set(userid, refreshToken);


        // 로그인 성공
        res.status(200).json({ message: "로그인 성공", accessToken: accessToken, refreshToken: refreshToken,  userid: userid});

    } catch (error) {
        
        next(error);
    }
}

//토큰 리프레시
async function tokenRefresh (req, res, next) {

    const { userid, refreshToken} = req.body;

   console.log("userid:", userid);  
   console.log("refreshToken:", refreshToken);  
   console.log("refreshTokens:", refreshTokens);  

    //토큰 유효성 검사
    if(!refreshToken || !refreshTokens.has(userid)){
        return res.status(403).json({ message: "토큰이 잘못되었습니다." });
    }

    //map객체에서 refresh토큰을 가져온다.
    const storedToken = refreshTokens.get(userid);
    
    //map 객체에 있던 토큰 유효성 검사
    if (storedToken !== refreshToken) {
        return res.status(403).json({ message: "토큰이 잘못되었습니다." });
    }
    try { 
        const payload = jwt.verify(refreshToken, process.env.JWT_SECRET_KEY);
        const newAccessToken = jwt.sign({ userid: payload.userid }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        return res.status(403).json({ message: "토큰이 잘못되었습니다." });
    }
}

module.exports = {
    createUser,
    getUserById,
    deleteUser,
    loginCheck,
    tokenRefresh
}