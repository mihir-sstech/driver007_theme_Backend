const ejs = require('ejs');
const path = require("path")
const fs = require('fs');
const moment = require('moment');
const nodeMailer = require("nodemailer");
const { isEmpty } = require("../utils/utils")
const constant = require("../constant/constant.json")
const EmailSetting = require("../models/setting/emailSettingModel");
const TemplateType = require("../models/setting/templateTypeModel");
const Company = require("../models/company/companyModel");

const sendEmail = async (from = '', to, subject, text) => {

  const transporter = nodeMailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: constant.SMTP_DETAILS.EMAIL,
      pass: constant.SMTP_DETAILS.PASSWORD,
    },
  });

  const mailOptions = {
    from: from || `Driver007 < ${constant.SMTP_DETAILS.EMAIL} >`,
    to,
    bcc: 'hetvi.sstech@gmail.com',
    subject,
    html: text,
  };
  // return transporter
  //   .sendMail(mailOptions)
  //   .then((info) => console.log(`Message sent: ${info.response}`))
  //   .catch((err) => console.log(`Problem sending email: ${err}`));

  // await transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log('Error:', error);
  //     return "success";
  //   } else {
  //     console.log('Email sent:', info.response);
  //     return "error";
  //   }
  // });

  return transporter
    .sendMail(mailOptions)
    .then((info) => console.log(`Message sent: ${info.response}`))
    .catch((err) => console.log(`Problem sending email: ${err}`));
};

const sendEmail_bkp = (from = '', to, subject, text) => {
  return new Promise((resolve, reject) => {
    const transporter = nodeMailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: constant.SMTP_DETAILS.EMAIL,
        pass: constant.SMTP_DETAILS.PASSWORD,
      },
    });

    const mailOptions = {
      from: `Driver007 <${constant.SMTP_DETAILS.EMAIL}>`,
      to,
      subject,
      html: text,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error:', error);
        reject("error"); // Reject the promise with the error
      } else {
        console.log('Email sent:', info.response);
        resolve("success"); // Resolve the promise with the response
      }
    });
  });
};

exports.sendResetPasswordEmail = async (to, token) => {
  const subject = `Reset passsword for ${to}`;
  const verificationEmailUrl = `${constant.CLIENT_URL}/reset-password?uid=${token}`;
  const text = `Dear user,
To reset your password, click on this link: <a href='${verificationEmailUrl}'>Click here</a><br>
If you did not Request for Reset Password, then ignore this email.`;

  await sendEmail('', to, subject, text);
};

exports.userInvitationEmail = async (to, password, company) => {
  const subject = `Invitation for ${company.name}`;
  const text = `Dear User,
        You're invited to ${company.name}. this is your password:<b>${password}</b> for login click <a href='${constant.CLIENT_URL}/login'>here</a>.
        you can also login via copy this URL on your browser: ${constant.CLIENT_URL}/login
        `;

  await sendEmail(to, subject, text);
};

const replacePlaceholders = (text, replacements) => {
  for (const placeholder in replacements) {
    if (Object.hasOwnProperty.call(replacements, placeholder)) {
      const regex = new RegExp(`{${placeholder}}`, 'g');
      text = text.replace(regex, replacements[placeholder]);
    }
  }
  return text;
};

exports.sendUserVerifyEmail = async (to, token, email_temp) => {

  if (!isEmpty(email_temp)) {
    const verificationEmailUrl = `${constant.CLIENT_URL}/user-verify?uid=${token}`;
    const replacements = { VERIFICATIONURL: `<a href='${verificationEmailUrl}'>here</a>` };
    const text = replacePlaceholders(email_temp.email_body, replacements);

    const from = `${email_temp.sender_name} < ${email_temp.sending_email_address} >`;
    const subject = email_temp.email_subject;
    try {
      const email_res = await sendEmail(from, to, subject, text);
      return "success";
    } catch (error) {
      return "error";
    }

  }

};

exports.emailSending = async (to, company_id = 1, template_id, replacements) => {

  const comp_data = await Company.findOne({ where: { id: company_id, is_deleted: 0, enable: 1 }, attributes: ["name", "logo", "company_domain", "support", "t_and_c", "copy_right_text", "contact_us_link"], raw: true })

  let email_temp = '';
  email_temp = await EmailSetting.findOne({ where: { template_id: template_id, company_id: company_id, enable: 1, is_deleted: 0 }, attributes: { exclude: ['enable', 'created_by', 'updated_by', 'deleted_by', 'created_at', 'deleted_at', 'updated_at', 'is_deleted'] }, raw: true });
  if (isEmpty(email_temp)) {
    email_temp = await EmailSetting.findOne({ where: { template_id: template_id, company_id: 1, enable: 1, is_deleted: 0 }, attributes: { exclude: ['enable', 'created_by', 'updated_by', 'deleted_by', 'created_at', 'deleted_at', 'updated_at', 'is_deleted'] }, raw: true });
  }

  // const template_data = await TemplateType.findByPk(template_id, { attributes: ["fields"], raw: true })

  if (!isEmpty(email_temp)) {
    var date = moment();
    var currentDate = date.format('D-MM-YYYY');

    const templte_path = path.join(__dirname, '../', 'email_templates/commonTemplate.html');
    let rawTmpData = fs.readFileSync(templte_path, 'utf8')
    replacements = {
      ...replacements,
      LOGOLINK: "#",
      LOGO: `${constant.COMPANY_SERVICE_URL}/${constant.IMG_UPLOAD_DIR}/${comp_data.logo}` || `${constant.CLIENT_URL}/assets/driver007-dark.ba3a3439.png`,
      DATE: currentDate,
      WEBSITEURL: comp_data.company_domain || "#",
      FAQURL: "#",
      SUPPORTURL: comp_data.support || "#",
    };

    rawTmpData = replacePlaceholders(rawTmpData, { EMAILBODY: email_temp.email_body });
    const body_with_data = replacePlaceholders(rawTmpData, replacements);
    const subject = email_temp.email_subject;

    console.log('*********Email Subject: ', subject);

    try {
      await sendEmail("", to, subject, body_with_data);
      return "success";
    } catch (error) {
      return "error";
    }
  }

};