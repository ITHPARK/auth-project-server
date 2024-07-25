const mongoose = require('mongoose');
const bcrypt = require('bcrypt');


//required = 필수 값, unique = 고유 값
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    userid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, unique: true }
});

//사용자 정보를 저장하기 전 비밀번호를 해시화

//pre: save 이벤트가 발생하기 전에 실행될 함수를 등록
userSchema.pre('save', async function (next){
    try {
        //isModified: mongoose내장 함수. 해당 값이 db에 기록된 값과 비교해서 변경된 경우 true를, 그렇지 않은 경우 false를 반환하는 함수
        //isNew: 새로 생성된 문서인지를 확인. password 필드가 변경되었거나 새로 생성된 문서인 경우를 확인
        if (this.isModified('password') || this.isNew) {
          const hashedPassword = await bcrypt.hash(this.password, 10);
          this.password = hashedPassword;
        }
        next();
      } catch (error) {
        next(error);
      }
});

module.exports = mongoose.model('User', userSchema);