import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { UserRepo } from "./user.repo";
import { CreateUserDto, PaginatedResponse, PaginationOptions, UpdateUserDto, User, UserFilter } from "./user.dto";
import * as bcrypt from 'bcrypt'

@Injectable()
export class UserService {
    constructor(
        private userRepo: UserRepo,
    ) { }

    async create(userData: CreateUserDto): Promise<User> {
        // Check if email already exists
        const existingUser = await this.userRepo.findByEmail(userData.email);
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password_hash, 10);

        const user = await this.userRepo.create({
            ...userData,
            password: hashedPassword,
        });

        return user;
    }


    async findById(id: number): Promise<User> {
        const user = await this.userRepo.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async findAll(filter: UserFilter, pagination: PaginationOptions): Promise<PaginatedResponse<User>> {
        return await this.userRepo.findAll(filter, pagination);
    }

    async update(id: number, userData: UpdateUserDto): Promise<User> {
        const user = await this.userRepo.update(id, userData);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    async delete(id: number): Promise<void> {
        const success = await this.userRepo.softDelete(id);
        if (!success) {
            throw new NotFoundException('User not found');
        }
    }

    async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
        const user = await this.userRepo.findByEmailWithPassword(
            (await this.findById(id)).email
        );

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new BadRequestException('Current password is incorrect');
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        const success = await this.userRepo.changePassword(id, hashedNewPassword);

        if (!success) {
            throw new NotFoundException('User not found');
        }
    }

    async getUserStats(): Promise<any> {
        return await this.userRepo.getUserStats();
    }

    async searchUsers(keyword: string, limit: number = 10): Promise<User[]> {
        if (!keyword || keyword.trim().length < 2) {
            throw new BadRequestException('Search keyword must be at least 2 characters');
        }

        return await this.userRepo.searchUsers(keyword.trim(), limit);
    }

    async bulkUpdateStatus(ids: number[], status: 'active' | 'inactive' | 'blocked'): Promise<number> {
        if (ids.length === 0) {
            throw new BadRequestException('No user IDs provided');
        }

        return await this.userRepo.bulkUpdateStatus(ids, status);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userRepo.findByEmailWithPassword(email);
        if (!user) {
            return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return null;
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }
}