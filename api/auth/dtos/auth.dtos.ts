import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator"

export class RegisterDto {  
    @IsNotEmpty()
    name: string

    @Matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    phone: string

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @MinLength(6)
    password: string

    status: number

    @IsNotEmpty()
    roleName: string
}

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @MinLength(6)
    password:string
}

