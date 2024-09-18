import nodeMailer from "nodemailer";
import * as NodemailMarkdown from "nodemailer-markdown";

const _EMAIL_HTML_RESET_PIN_NUMBER_ = `
<html>
  <head>
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@100;400&display=swap");
    </style>
  </head>
  <body class="body">
    <table
      id="root"
      align="center"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      bgcolor="#F9F9F9"
      style="border-collapse: collapse"
    >
      <tbody>
        <tr>
          <td width="100%" height="68" bgcolor="#F9F9F9"></td>
        </tr>
        <tr>
          <td width="6%" height="25" bgcolor="#F9F9F9" align="center">
            <img
              style="width: 175px; height: 23px"
              src="https://firebasestorage.googleapis.com/v0/b/marina-protocol.appspot.com/o/assets%2Fmarina-protocol_logo.png?alt=media"
              alt="Marina Protocol Logo"
            />
          </td>
        </tr>
        <tr>
          <td width="100%" height="25" bgcolor="#F9F9F9"></td>
        </tr>
        <tr>
          <td width="100%" height="18"></td>
        </tr>
        <tr>
          <td
            width="100%"
            align="center"
            style="
              font-family: Poppins, Arial, sans-serif;
              font-style: normal;
              font-weight: 400;
              font-size: 36px;
              line-height: 40px;
              text-align: center;
              color: #44484a;
            "
          >
            <span>Reset PIN Number</span>
          </td>
        </tr>
        <tr>
          <td width="100%" height="48"></td>
        </tr>
        <tr>
          <td
            width="100%"
            align="center"
            style="
              font-family: Poppins, Arial, sans-serif;
              font-style: normal;
              font-weight: 400;
              font-size: 18px;
              line-height: 28px;
              text-align: center;
              color: #858585;
            "
          >
            This email is sent for resetting PIN Number.<br />
            To change your PIN Number, please click the
            <span style="color: #03c65b">'Reset PIN Number'<span>
            button.
          </td>
        </tr>
        <tr>
          <td width="100%" height="24"></td>
        </tr>
        <tr>
          <td
            width="100%"
            style="
              font-family: Poppins, Arial, sans-serif;
              font-style: normal;
              font-weight: 400;
              font-size: 14px;
              line-height: 20px;
              text-align: center;
              color: #bdbdbd;
            "
          >
            This mail is only for sending, not being used for replying.
          </td>
        </tr>
        <tr>
          <td width="100%" height="64"></td>
        </tr>
        <tr>
          <td width="100%" align="center">
            <a
              href="https://marina-protocol.com/link?path=resetPincode"
              style="
                -webkit-appearance: button;
                -moz-appearance: button;
                appearance: button;
                text-decoration: none;
                background-color: #03c65b;
                background-image: linear-gradient(#03c65b, #03c65b);
                width: 240px;
                padding: 20px 36px;
                border-radius: 8px;
                text-align: center;
              "
            >
                <span style="font-family: Poppins, Arial, sans-serif;
                    font-style: normal;
                    font-weight: 600;
                    font-size: 18px;
                    line-height: 28px;
                    color: #ffffff;">
                    Reset PIN Number
                <span>
            </a>
          </td>
        </tr>
        <tr>
          <td width="100%" height="64"></td>
        </tr>
        <tr>
          <td
            width="100%"
            style="
              font-family: Poppins, Arial, sans-serif;
              font-style: normal;
              font-weight: 400;
              font-size: 14px;
              line-height: 20px;
              text-align: center;
              color: #858585;
            "
          >
            <span
              >For any other errors or inquiries, please contact out customer
              service center.</span
            >
            <br />
            <span>support@marina-protocol.com</span>
          </td>
        </tr>
        <tr>
          <td width="100%" height="68"></td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
`;

// eslint-disable-next-line quotes
const from = '"Marina Protocol" master@marina-protocol.com';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export enum MAIL_TYPE {
  RESET_PIN_NUMBER = "reset_pin_number",
}

export const sendMail2 = async (to: string) => {
  const transporter = nodeMailer.createTransport({
    service: "gmail",
    /* Gmail Host */
    host: "smtp.gmail.com",
    /* Mail port */
    port: 465,
    auth: { user: "master@marina-protocol.com", pass: "ubanidjkyhhtuehq" },
    secure: true,
  });

  const mailOptions = {
    to,
    subject: "hello, Marina Protocol",
    text: "hello, Marina Protocol",
  };
  const res = await transporter.sendMail(mailOptions);
  // console.log(res);
  return !!res;
};

export const sendPincodeResetmail = async (
  type: string,
  to: string,
  data?: Map<string, string>
) => {
  try {
    let subject = "";
    let contents = "";

    if (type == "reset_pin_number") {
      subject = "Reset PIN Number";
      contents = _EMAIL_HTML_RESET_PIN_NUMBER_;
    } else {
      throw new Error("Invalid Mail Type");
    }

    if (data) {
      data.forEach((value: string, key: string) => {
        contents = contents.replace(new RegExp(escapeRegExp(key), "g"), value);
      });
    }

    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: { user: "master@marina-protocol.com", pass: "ubanidjkyhhtuehq" },
      secure: true,
    });

    const mailOptions = {
      from,
      to,
      subject,
      html: contents,
    };
    const res = await transporter.sendMail(mailOptions);
    console.log(res);
    return !!res;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};

export const sendAdminAletMail = async (to: string[], message: string) => {
  return sendMail(to, "Marina Protocol ADMIN ALERT", message, "markdown");
};

export const sendMail = async (
  to: string | string[],
  subject: string,
  contents: string,
  type: string
) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: { user: "master@marina-protocol.com", pass: "ubanidjkyhhtuehq" },
      secure: true,
    });

    const mailOptions: {
      from: string;
      to: string | string[];
      subject: string;
      html?: string;
      text?: string;
      markdown?: string;
    } = {
      from,
      to,
      subject,
    };

    if (type == "html") {
      mailOptions["html"] = contents;
    } else if (type == "text") {
      mailOptions["text"] = contents;
    } else if (type == "markdown") {
      transporter.use("compile", NodemailMarkdown.markdown());
      mailOptions["markdown"] = contents;
    }

    const res = await transporter.sendMail(mailOptions);

    return !!res;
  } catch (err: any) {
    console.error(err);
    return false;
  }
};
