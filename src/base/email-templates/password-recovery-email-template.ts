export const passwordRecoveryEmailTemplate = (
  confirmationCode: string,
): string => {
  return `
        <h1>Password recovery</h1>
        <p>To finish password recovery please follow the link below:
          <a href='https://somesite.com/password-recovery?recoveryCode=${confirmationCode}'>recovery password</a>
        </p>
    `;
};
