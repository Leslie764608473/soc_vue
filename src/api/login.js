
// 註冊配置項
const getRegister = '/soc/sso/getRegister';
// 獲取所有屬會
const serviceList = '/soc/sso/serviceList';
// 註冊
const register = '/soc/sso/register';
// 获取手机验证码
const smsCode = '/soc/sso/getAuthCode';
// 登錄
const login = '/soc/sso/login';
const loginNot = '/soc/sso/loginNot';
// 登出
const logout = '/soc/sso/logout';
// 刷新refreshToken
const refreshToken = '/soc/sso/token/refresh';
// 检验手机号是否存在
const verifyTelephone = '/soc/sso/verifyTelephone';

const verifyAccessToken = '/soc/sso/verifyUserToken';

const getOrgList = '/soc/sso/getOrgList';
const getNewOrg  = '/soc/sso/getNewOrg';

const getSessionKeyOrOpenId = '/soc/sso/getSessionKeyOrOpenId';
const wechatLogin = '/soc/sso/wechatLogin';
const bindMobile = '/soc/sso/bindMobile';
const loginByAuthCode = '/soc/sso/loginByAuthCode';

const getNative = '/soc/sso/getNative';
const getHometownDict = '/soc/sso/getHometownDict';

const getCreateQRCodeMessage = '/soc/sso/getCreateQRCodeMessage';
export {
	getRegister,
	serviceList,
	register,
	smsCode,
	login,
	logout,
	refreshToken,
	verifyTelephone,
	verifyAccessToken,
	getOrgList,
	getNewOrg,
	loginNot,
	getSessionKeyOrOpenId,
	wechatLogin,
	bindMobile,
	loginByAuthCode,
	getNative,
	getHometownDict,
	getCreateQRCodeMessage
};
