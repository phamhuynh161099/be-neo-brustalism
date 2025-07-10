import { Injectable } from "@nestjs/common";
import { DatabaseNeoBrustalismService } from "src/shared/database/database-neo-brustalism.service";

@Injectable()
export class AuthRepo {
    constructor(
        private databaseService: DatabaseNeoBrustalismService,
    ) {

    }

    async findUniqueUserIncludeRole(data: {
        username: string
    }) {
        const query = `
            SELECT id, username, email, password_hash, is_active, created_at, updated_at
            FROM user 
            WHERE username = ? AND is_active = 1
        `;

        const result = await this.databaseService.executeRawQuery(query, [data.username]);
        return result.length > 0 ? result[0] : null;
    }


    async registerAccount(data: {
        username: string,
        password_hash: string,
        email: string
    }) {
        const query = `
            INSERT INTO user (username, email, password_hash, is_active, created_at, updated_at)
            VALUES (?, ?, ?, '1', NOW(), NOW())
        `;

        const result = await this.databaseService.executeRawQuery(query, [
            data.username,
            data.email,
            data.password_hash,
        ]);

        return this.findById(result.insertId)
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
}