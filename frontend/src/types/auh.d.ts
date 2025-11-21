interface AuthenticatedUser extends BaseEntity {
  name: string;
  email: string;
   operations:  Operation[]
  discussions: Discussion[]
}


interface LoginFormFields {
  email: string;
  password: string;
}

interface LoginRequestPayload {
  email: string;
  password: string;
}

interface AuthResponse{
  accessToken: string
  refreshToken: string
  user: AuthenticatedUser
}


interface RegisterRequestPayload {
  name: string
  email: string;
  password: string;
}

interface RegisterFormFields {
  name: string
  email: string;
  password: string;
  confirmPassword: string;
}
