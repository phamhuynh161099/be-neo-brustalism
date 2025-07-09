import { Injectable } from "@nestjs/common";
import { DatabaseNeoBrustalismService } from "src/shared/database/database-neo-brustalism.service";
import { PaginatedResponse, PaginationOptions, UpdateUserDto, User, UserFilter } from "./user.dto";

@Injectable()
export class UserRepo {
    constructor(
        private databaseService: DatabaseNeoBrustalismService,
    ) { }

    async create(userData: any): Promise<any> {
        const query = `
            INSERT INTO user (username, email, password_hash, is_active, created_at, updated_at)
            VALUES (?, ?, ?, '1', NOW(), NOW())
        `;

        const result = await this.databaseService.executeRawQuery(query, [
            userData.username,
            userData.email,
            userData.password_hash,
        ]);

        return this.findById(result.insertId);
    }

    async findById(id: number): Promise<any | null> {
        const query = `
            SELECT id, username, email, password_hash, is_active, created_at, updated_at
            FROM user 
            WHERE id = ? AND is_active = 1
        `;

        const result = await this.databaseService.executeRawQuery(query, [id]);
        return result.length > 0 ? result[0] : null;
    }

    async findByEmail(email: string): Promise<any | null> {
        const query = `
            SELECT id, username, email, password_hash, is_active, created_at, updated_at
            FROM user 
            WHERE email = ? AND is_active = 1
        `;

        const result = await this.databaseService.executeRawQuery(query, [email]);
        return result.length > 0 ? result[0] : null;
    }

    async findByEmailWithPassword(email: string): Promise<any | null> {
        const query = `
            SELECT id, username, email, password_hash, is_active, created_at, updated_at
            FROM user 
            WHERE email = ? AND deleted_at IS NULL
        `;

        const result = await this.databaseService.executeRawQuery(query, [email]);
        return result.length > 0 ? result[0] : null;
    }


    async findAll(filter: UserFilter, pagination: PaginationOptions): Promise<PaginatedResponse<User>> {
        const conditions: string[] = [];
        const params: any[] = [];

        // Build WHERE conditions
        conditions.push('deleted_at IS NULL');

        if (filter.is_active) {
            conditions.push('is_active = ?');
            params.push(filter.is_active);
        }

        if (filter.email) {
            conditions.push('email LIKE ?');
            params.push(`%${filter.email}%`);
        }

        if (filter.name) {
            conditions.push('name LIKE ?');
            params.push(`%${filter.name}%`);
        }

        if (filter.created_from) {
            conditions.push('created_at >= ?');
            params.push(filter.created_from);
        }

        if (filter.created_to) {
            conditions.push('created_at <= ?');
            params.push(filter.created_to);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Count total records
        const countQuery = `SELECT COUNT(*) as total FROM user ${whereClause}`;
        const countResult = await this.databaseService.executeRawQuery(countQuery, params);
        const total = countResult[0].total;

        // Build ORDER BY clause
        const sortBy = pagination.sort_by || 'created_at';
        const sortOrder = pagination.sort_order || 'DESC';
        const orderBy = `ORDER BY ${sortBy} ${sortOrder}`;

        // Build LIMIT and OFFSET
        const offset = (pagination.page - 1) * pagination.limit;
        const limitClause = `LIMIT ? OFFSET ?`;

        // Main query
        const query = `
            SELECT id, username, email, password_hash, is_active, created_at, updated_at
            FROM user 
            ${whereClause}
            ${orderBy}
            ${limitClause}
        `;

        const data = await this.databaseService.executeRawQuery(query, [...params, pagination.limit, offset]);

        return {
            data,
            total,
            page: pagination.page,
            limit: pagination.limit,
            total_pages: Math.ceil(total / pagination.limit),
        };
    }

    async update(id: number, userData: UpdateUserDto): Promise<User | null> {
        const fields: string[] = [];
        const params: any[] = [];

        if (userData.email !== undefined) {
            fields.push('email = ?');
            params.push(userData.email);
        }

        if (userData.is_active !== undefined) {
            fields.push('is_active = ?');
            params.push(userData.is_active);
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        fields.push('updated_at = NOW()');
        params.push(id);

        const query = `
            UPDATE user 
            SET ${fields.join(', ')}
            WHERE id = ? AND deleted_at IS NULL
        `;

        const result = await this.databaseService.executeRawQuery(query, params);

        if (result.affectedRows === 0) {
            return null;
        }

        return this.findById(id);
    }

    async softDelete(id: number): Promise<boolean> {
        const query = `
            UPDATE user 
            SET deleted_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        `;

        const result = await this.databaseService.executeRawQuery(query, [id]);
        return result.affectedRows > 0;
    }

    async hardDelete(id: number): Promise<boolean> {
        const query = `DELETE FROM user WHERE id = ?`;
        const result = await this.databaseService.executeRawQuery(query, [id]);
        return result.affectedRows > 0;
    }

    async changePassword(id: number, newPassword: string): Promise<boolean> {
        const query = `
            UPDATE user 
            SET password = ?, updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        `;

        const result = await this.databaseService.executeRawQuery(query, [newPassword, id]);
        return result.affectedRows > 0;
    }


    async getUserStats(): Promise<any> {
        const query = `
            SELECT 
                COUNT(*) as total_users,
                SUM(CASE WHEN is_active = '1' THEN 1 ELSE 0 END) as active_users,
                SUM(CASE WHEN is_active = '0' THEN 1 ELSE 0 END) as inactive_users,
                SUM(CASE WHEN is_active = '2' THEN 1 ELSE 0 END) as blocked_users,
                SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as new_users_today,
                SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_users_this_week
            FROM user 
            WHERE deleted_at IS NULL
        `;

        const result = await this.databaseService.executeRawQuery(query);
        return result[0];
    }

    async searchUsers(keyword: string, limit: number = 10): Promise<User[]> {
        const query = `
            SELECT id, username, email, password_hash, is_active, created_at, updated_at
            FROM user
            WHERE (username LIKE ? OR email LIKE ?) 
                AND deleted_at IS NULL
            ORDER BY 
                CASE 
                WHEN username LIKE ? THEN 1
                WHEN email LIKE ? THEN 2
                ELSE 3
                END,
                username ASC
            LIMIT ?
        `;

        const searchPattern = `%${keyword}%`;
        const exactPattern = `${keyword}%`;

        return await this.databaseService.executeRawQuery(query, [
            searchPattern,
            searchPattern,
            exactPattern,
            exactPattern,
            limit,
        ]);
    }


    async bulkUpdateStatus(ids: number[], status: string | number): Promise<number> {
        if (ids.length === 0) return 0;

        const placeholders = ids.map(() => '?').join(',');
        const query = `
            UPDATE user 
            SET is_active = ?, updated_at = NOW()
            WHERE id IN (${placeholders}) AND deleted_at IS NULL
        `;

        const result = await this.databaseService.executeRawQuery(query, [status, ...ids]);
        return result.affectedRows;
    }

}