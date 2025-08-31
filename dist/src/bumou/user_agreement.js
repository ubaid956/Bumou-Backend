"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chineseAgree = exports.englishAgree = void 0;
exports.englishAgree = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Privacy Policy</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
      }

      h1,
      h2,
      h3 {
        color: #333;
      }

      p {
        line-height: 1.6;
        color: #666;
      }

      a {
        color: #007bff;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
      #languageDropdown {
        margin-bottom: 10px;
      }
    </style>
  </head>
  <body>
    <label for="languageDropdown">Language：</label>
    <select id="languageDropdown" onchange="changeLanguage(this.value)">
      <option value="en" selected>🇬🇧 English</option>
      <option value="zh">🇨🇳 中文</option>
    </select>
    <h1>Bumou App User Agreement</h1>
    <p>Last updated: December, 4 2024</p>
    <p>Effective date: April, 1 2024</p>

    <p>
    Welcome to Bumou App. Please read and agree to the following terms before using this application. If you do not agree to any part of these terms, please stop using the app immediately.
    </p>

    <h2>Developer and company information</h2>
    <p>
      Application name:Bumou <br>
      Name: Yang Jing <br>
      Company: Shanghai Xuxiu Information Technology Co., Ltd <br>
      Email: yang_jing_1186@hotmail.com <br>
      Phone: 18201840625 <br>
      Address: Room 147, Building 37, No. 4399 Wusi Road, Haiwan Town, Fengxian District, Shanghai <br>
      Postal Code: 221100
    </p>

    <h2>1. User Registration and Account</h2>
    <p>
      1.1 You must register with accurate, truthful, and complete information. <br>
      1.2 You are responsible for the accuracy and legality of your registration details. Incorrect information may result in service interruptions. <br>
      1.3 Users under 14 years old must obtain explicit consent from their guardians before registering and using the app.
    </p>

    <h2>2. Scope of Services</h2>
    <p>
      2.1 The app provides features including social interaction, mood tracking, and emergency assistance. <br>
      2.2 We reserve the right to adjust or terminate certain features due to technical maintenance or policy changes, with adjustments communicated via in-app notifications.
    </p>

    <h2>3. User Conduct</h2>
    <p>3.1 Users must comply with Chinese laws and regulations, as well as public morals, while using the app. <br>
        3.2 The following behaviors are strictly prohibited: <br>
        Uploading or sharing illegal, obscene, violent, false, or defamatory content. <br>
        Attempting unauthorized access to the app’s servers or disrupting its operation. <br>
        Impersonating other users or illegally collecting others’ information. <br>
        3.3 Users violating these terms may have their accounts suspended or terminated.
    </p>



    <h2>4. Application Feature Guidelines</h2>
    <p>4.1 Push Notifications: With user consent, the app will send notifications related to chat messages and emergency requests. <br>
       4.2 Auto-Start: To ensure proper functioning, the app may auto-start via system broadcasts. Permissions can be adjusted in device settings. <br>
       4.3 Mood Tracking: This feature records user mood data for self-assessment and service optimization, requiring user consent. 
    </p>

    <h2>5. User Content Management</h2>
    <p>
        5.1 Users must ensure that their uploaded content complies with legal requirements and does not infringe on third-party rights. <br>
        5.2 Users are fully responsible for the legality and security of their content. <br>
        5.3 The app reserves the right to delete reported or verified illegal or infringing content without prior notice.

    </p>
    <h2>6. Data Privacy and Security</h2>
    <p>
      6.1 User data will be protected in accordance with the Bumou App Privacy Policy, which users can access for detailed information. <br>
      6.2 Users are responsible for keeping their account credentials secure. Losses due to negligence will be borne by the user.
    </p>
    <h2>7. Intellectual Property</h2>
    <p>7.1 All content within the app, including but not limited to text, images, videos, and source code, is owned by Shanghai Xuxiu Information Technology Co., Ltd. <br>
       7.2 Users shall not copy, modify, distribute, or commercialize any app content without authorization.
    </p>

    <h2>8. Liability Limitation</h2>
    <p>8.1 Users are solely responsible for the consequences of violations of this agreement or applicable laws. <br>
       8.2 The app is not liable for service interruptions or data loss caused by force majeure or third-party actions.
    </p>


    <h2>9. Agreement Modification and Termination</h2>
    <p>
      9.1 We reserve the right to modify this agreement at any time, with updates communicated via in-app notifications. <br>
      9.2 If users disagree with the revised terms, they should stop using the app and delete their account. Continued use constitutes acceptance of the new terms.
    </p>


    <h2>10. Governing Law and Dispute Resolution</h2>
    <p>10.1 This agreement is governed by the laws of the People’s Republic of China. <br>
       10.2 Any disputes arising from this agreement should be resolved amicably. If unresolved, they may be submitted to the courts of Shanghai for litigation.
    </p>

    


    <script>
      function changeLanguage(selectedLanguage) {
        // Define the language-specific URLs
        const languageUrls = {
          en: window.location.href.split('?')[0] + '?lang=en',
          zh: window.location.href.split('?')[0] + '?lang=zh',
        };

        window.location.href = languageUrls[selectedLanguage];
      }
    </script>
  </body>
</html>`;
exports.chineseAgree = `
        <!DOCTYPE html>
        <html lang="zh">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>隐私政策</title>
            <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }

            h1, h2, h3 {
                color: #333;
            }

            p {
                line-height: 1.6;
                color: #666;
            }

            a {
                color: #007bff;
                text-decoration: none;
            }

            a:hover {
                text-decoration: underline;
            }
            #languageDropdown {
                margin-bottom: 10px;
            }
            </style>
        </head>
        <body>
        <label for="languageDropdown">选择语言：</label>
        <select id="languageDropdown" onchange="changeLanguage(this.value)">
            <option value="en">🇬🇧 English</option>
            <option value="zh" selected>🇨🇳 中文</option>
        </select>
        <h1>咘呣App用户协议</h1>

        <p>生效日期：2024年4月1日 - 最后更新日期：2024年12月4日</p>

<p>
  欢迎使用咘呣App。在使用本应用之前，请仔细阅读并同意以下用户协议条款。如果您不同意本协议中的任何内容，请立即停止使用本应用。
</p>

<h2>开发者及公司信息</h2>
    <p>
      应用名称：咘呣 <br>
      姓名：杨晶 <br>
      公司：上海旭修信息技术有限公司 <br>
      邮箱：yang_jing_1186@hotmail.com <br>
      电话：18201840625 <br>
      地址：上海市奉贤区海湾镇五四公路4399号37幢147室 <br>
      邮编：221100
    </p>

<h2>1. 用户注册与账户</h2>
<p>
  1.1 您必须使用真实、准确和完整的信息进行注册。<br>
1.2 您对注册信息的准确性和合法性负责，若信息有误可能导致服务中断。<br>
1.3 14岁以下用户需获得其监护人明确同意后方可注册并使用本应用。


</p>

<h2>2. 服务范围</h2>
<p>我们收集的个人信息将用于以下目的：<br>
2.1 本应用为用户提供社交互动、情绪跟踪及紧急求助功能。<br>
2.2 因技术维护或政策变更，我们可能随时调整服务范围或终止部分功能，调整将通过应用内通知告知用户。

</p>


<h2>3. 用户行为规范</h2>
<p>3.1 用户在使用本应用时应遵守中国法律法规以及社会公共道德。<br>
3.2 以下行为被严格禁止：<br>
上传、传播违法、淫秽、暴力、虚假或诽谤性内容。<br>
试图未经授权访问本应用的服务器或破坏应用运行。<br>
冒充其他用户或非法收集他人信息。<br>
3.3 若用户行为违反本协议条款，本应用有权暂停或终止其账户。

</p>


<h2>4. 应用功能使用说明</h2>
<p>4.1 推送通知：用户授权后，应用将发送与聊天消息、紧急请求相关的推送通知。<br>
4.2 自动启动：为确保服务正常运行，应用可能通过系统广播实现自动启动。用户可在设备设置中调整权限。<br>
4.3 情绪跟踪功能：本功能记录用户的情绪变化数据，用户授权后可供自我评估和功能优化使用。

</p>


<h2>5. 用户内容管理</h2>
<p>
  5.1 用户上传的内容必须符合法律要求，不得侵犯第三方的合法权益。<br>
5.2 用户对其内容的合法性和安全性承担全部责任。<br>
5.3 本应用有权删除被举报或经确认违法、侵权的内容，且无需另行通知。

</p>

<h2>6. 数据隐私与安全</h2>
<p>
  6.1 我们将根据《咘呣App隐私政策》保护用户的数据隐私，用户可访问政策了解详情。<br>
6.2 用户应妥善保管账户和密码信息，因用户自身疏忽导致的损失由用户自行承担。


</p>

<h2>7. 知识产权</h2>
<p>7.1 本应用的所有内容，包括但不限于文字、图像、视频和代码，均归属上海旭修信息技术有限公司所有。<br>
7.2 未经授权，用户不得复制、修改、传播或商业化使用本应用内容。
</p>

<h2>8. 责任限制</h2>
<p>8.1 用户因违反本协议或相关法律法规所产生的后果由用户自行承担。<br>
8.2 本应用因不可抗力或第三方原因导致的服务中断或数据丢失，不承担责任。
</p>

<h2>9. 协议的修改与终止</h2>
<p>
  9.1 我们保留随时修改本协议条款的权利，更新后的内容将通过应用内公告通知用户。<br>
9.2 如果用户不同意修改后的条款，应停止使用并注销账户；否则，视为用户同意新协议。

</p>

<h2>10. 法律适用与争议解决</h2>
<p>10.1 本协议适用中华人民共和国法律。<br>
10.2 因本协议引发的任何争议，双方应友好协商解决；协商不成的，可提交上海市有管辖权的法院诉讼解决。
</p>





    <script>
        function changeLanguage(selectedLanguage) {
            // Define the language-specific URLs
            const languageUrls = {
                'en': window.location.href.split('?')[0]+ '?lang=en', 
                'zh': window.location.href.split('?')[0]+ '?lang=zh'};

            // Redirect to the selected language URL
            window.location.href = languageUrls[selectedLanguage];
        }
    </script>

</body>
</html>

`;
//# sourceMappingURL=user_agreement.js.map