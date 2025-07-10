import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcrypt'
export const SALT_ROUNDS = 10

@Injectable()
export class HashingService {
    hash(value: string) {
        return hash(value, SALT_ROUNDS)
    }

    compare(value: string, hash: string) {
        return compare(value, hash)
    }
}


/**
 * Dùng để hashing và compare data mã hóa
 */