import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegisterDto {
  @ApiProperty({ example: "admin@qalahood.kz" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "175287175287" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "qalahood", required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: "+77711021895", required: false })
  @IsOptional()
  @IsString()
  phone?: string;
}

export class LoginDto {
  @ApiProperty({ example: "admin@qalahood.kz" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "175287175287" })
  @IsString()
  password: string;
}
