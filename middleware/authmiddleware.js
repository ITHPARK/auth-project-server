const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {

    //ex) Bearer yourAccessToken 형식으로 온다 split을 하면 ['Bearer', 'yourAccessToken'] 인덱스 1은 토큰값을 말함
    const token = req.headers.authorization?.split(' ')[1];
    
    console.log(token);

    if (!token) {
        return res.status(401).json({ message: '인증 토큰이 없습니다.' });
    }

    try {
        const secretKey = process.env.JWT_SECRET_KEY;

        //토큰이 유효하면 해당 토큰에 포함된 정보를 해독하여 추출, 유효한 경우, 함수는 토큰의 페이로드 (Payload) 부분을 해독하여 JavaScript 객체로 반환
        const decoded = jwt.verify(token, secretKey);
        
        //유저 정보에 할당
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
    }
}

module.exports = authMiddleware;