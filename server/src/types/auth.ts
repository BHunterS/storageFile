export interface SignupRequestBody {
    email: string;
    password: string;
    name: string;
}

export interface VerifyEmailBody {
    code: string | number;
}

export interface LoginBody {
    email: string;
    password: string;
}

export interface ForgotPasswordBody {
    email: string;
}

export interface ResetPasswordBody {
    password: string;
}

export interface ResetPasswordParams {
    token: string;
}
