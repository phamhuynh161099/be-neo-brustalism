import { SetMetadata } from '@nestjs/common'
import { AuthType, AuthTypeType, ConditionGuard, ConditionGuardType } from 'src/shared/constants/auth.const'

export const AUTH_TYPE_KEY = 'authType'

export type AuthTypeDecoratorPayload = { authTypes: AuthTypeType[]; options: { condition: ConditionGuardType } }

export const Auth = (authTypes: AuthTypeType[], options?: { condition: ConditionGuardType }) => {
    return SetMetadata(AUTH_TYPE_KEY, { authTypes, options: options ?? { condition: ConditionGuard.And } })
}

export const IsPublic = () => Auth([AuthType.None])
