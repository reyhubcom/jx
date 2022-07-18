import axios from '@/lib/axios'
import { Listbox, Transition } from '@headlessui/react'
import React, {
    Fragment,
    FC,
    FormEvent,
    ChangeEvent,
    SetStateAction,
    useEffect,
    useState
} from 'react'
import { Role } from '@/types/auth'
import { User } from '@/types/user'
import { ExclamationIcon, SelectorIcon } from '@heroicons/react/outline'
import { useSWRConfig } from 'swr'
import Label from '@/components/form/Label'
import Input from '@/components/form/Input'
import Button from '@/components/ui/Button'
import InputSwitch from '@/components/form/InputSwitch'
import { XIcon } from '@heroicons/react/solid'

interface AddUserErrorProps extends SetStateAction<any> {
    name?: string
    email?: string
    password?: string
    password_confirmation?: string
}

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

const UserForm: FC<{
    user?: User
    handleClose: () => void
}> = ({ user, handleClose }) => {
    const { mutate } = useSWRConfig()
    const [loading, setLoading] = useState<boolean>(false)
    const [name, setName] = useState<string | undefined>(user?.name)
    const [email, setEmail] = useState<string | undefined>(user?.email)
    const [password, setPassword] = useState<string | undefined>(undefined)
    const [passwordConfirmation, setPasswordConfirmation] = useState<
        string | undefined
    >(undefined)
    const [newPassword, setNewPassword] = useState<string | undefined>(
        undefined
    )
    const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<
        string | undefined
    >(undefined)
    const [verifyEmail, setVerifyEmail] = useState<boolean | undefined>(
        user?.email_verified
    )
    const [enableAccount, setEnableAccount] = useState<boolean | undefined>(
        user?.enabled
    )
    const [errors, setErrors] = useState<AddUserErrorProps | undefined>(
        undefined
    )
    const [pageProps, setPageProps] = useState<[] | undefined>(undefined)
    const [selectedRoles, setSelectedRoles] = useState(
        user?.roles.map(role => role.name) || []
    )
    const [roles, setRoles] = useState<[]>([])

    useEffect(() => {
        setLoading(true)
        axios.get('api/users/props').then(res => {
            setPageProps(res.data)
            setRoles(
                res.data.options.roles.map((role: Role) => {
                    return role.name
                })
            )
        })
        setLoading(false)
    }, [user])

    const submitForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        event.stopPropagation()
        setLoading(true)
        setErrors(undefined)
        const userId = user?.id !== undefined ? '/' + user?.id : ''
        const requestType = user?.id !== undefined ? 'put' : 'post'

        await axios({
            method: requestType,
            url: 'api/users' + userId,
            data: {
                name: name,
                email: email,
                password: password,
                password_confirmation: passwordConfirmation,
                new_password: newPassword,
                new_password_confirmation: newPasswordConfirmation,
                email_verified: verifyEmail,
                enabled: enableAccount,
                roles: selectedRoles
            }
        })
            .then(() => {
                mutate('/api/users')
                handleClose()
                setTimeout(() => {
                    setLoading(false)
                }, 500)
            })
            .catch(error => {
                setLoading(false)
                if (
                    error.response.status !== 422 &&
                    error.response.status !== 403
                )
                    throw error

                setErrors(error.response.data)
            })
    }

    function removeRole(role: string) {
        const removedSelection = selectedRoles.filter(
            selected => selected !== role
        )
        setSelectedRoles(removedSelection)
    }

    return (
        <form onSubmit={submitForm}>
            {errors?.message && (
                <>
                    <div className="mb-2 flex items-center rounded bg-red-50 p-2 text-sm text-red-600">
                        <ExclamationIcon className="mr-2 inline-block h-5 w-5" />{' '}
                        {errors?.message}
                    </div>
                </>
            )}
            <div className="mb-3">
                <Label htmlFor="name" className="block">
                    Name
                </Label>
                <span className="text-xs text-red-500">
                    {errors?.errors?.name}
                </span>
                <Input
                    id="name"
                    type="text"
                    name="name"
                    value={name || ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setName(event.target.value)
                        setErrors((prevState: AddUserErrorProps) => {
                            return {
                                ...prevState,
                                ...{ name: undefined }
                            }
                        })
                    }}
                    className={
                        'mt-1 ' +
                        (errors?.errors?.name
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                            : '')
                    }
                />
            </div>
            <div className={`${user ? 'mb-5' : 'mb-3'}`}>
                <Label className="block">Email</Label>
                <span className="text-xs text-red-500">
                    {errors?.errors?.email}
                </span>
                <Input
                    id="email"
                    type="email"
                    name="email"
                    value={email || ''}
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setEmail(event.target.value)
                        setErrors((prevState: AddUserErrorProps) => {
                            return {
                                ...prevState,
                                ...{ email: undefined }
                            }
                        })
                    }}
                    className={
                        'mt-1 ' +
                        (errors?.errors?.email
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                            : '')
                    }
                />
            </div>
            {user === undefined ? (
                <>
                    <div className="mb-3">
                        <Label htmlFor="password" className="block">
                            Password
                        </Label>
                        <span className="text-xs text-red-500">
                            {errors?.errors?.password}
                        </span>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setPassword(event.target.value)
                                setErrors((prevState: AddUserErrorProps) => {
                                    return {
                                        ...prevState,
                                        ...{ password: undefined }
                                    }
                                })
                            }}
                            className={
                                'mt-1 ' +
                                (errors?.errors?.password
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                                    : '')
                            }
                        />
                    </div>
                    <div className="mb-3">
                        <Label
                            htmlFor="password-confirmation"
                            className="block">
                            Confirm Password
                        </Label>
                        <span className="text-xs text-red-500">
                            {errors?.errors?.password_confirmation}
                        </span>
                        <Input
                            type="password"
                            name="password_confirmation"
                            id="password-confirmation"
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setPasswordConfirmation(event.target.value)
                                setErrors((prevState: AddUserErrorProps) => {
                                    return {
                                        ...prevState,
                                        ...{
                                            password_confirmation: undefined
                                        }
                                    }
                                })
                            }}
                            className={
                                'mt-1 ' +
                                (errors?.errors?.password_confirmation
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                                    : '')
                            }
                        />
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-3">
                        <Label htmlFor="password" className="block">
                            New Password
                        </Label>
                        <span className="text-xs text-red-500">
                            {errors?.errors?.new_password}
                        </span>
                        <Input
                            type="password"
                            name="password"
                            id="password"
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setNewPassword(event.target.value)
                                setErrors((prevState: AddUserErrorProps) => {
                                    return {
                                        ...prevState,
                                        ...{ password: undefined }
                                    }
                                })
                            }}
                            className={
                                'mt-1 ' +
                                (errors?.errors?.new_password
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                                    : '')
                            }
                        />
                    </div>
                    <div className="mb-3">
                        <Label
                            htmlFor="password-confirmation"
                            className="mb-1 block">
                            Confirm New Password
                        </Label>
                        <span className="text-xs text-red-500">
                            {errors?.password_confirmation}
                        </span>
                        <Input
                            type="password"
                            name="password_confirmation"
                            id="password-confirmation"
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                setNewPasswordConfirmation(event.target.value)
                                setErrors((prevState: AddUserErrorProps) => {
                                    return {
                                        ...prevState,
                                        ...{
                                            password_confirmation: undefined
                                        }
                                    }
                                })
                            }}
                            className={
                                'mt-1 ' +
                                (errors?.name
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/30'
                                    : '')
                            }
                        />
                    </div>
                </>
            )}
            <div className="relative mb-6">
                <Label>Roles</Label>
                <Listbox
                    value={selectedRoles}
                    onChange={setSelectedRoles}
                    name="roles"
                    multiple>
                    <Listbox.Button className="relative w-full cursor-default rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm">
                        {!selectedRoles.length && (
                            <span className="leading-tight text-gray-400">
                                Select roles
                            </span>
                        )}
                        <div className="flex gap-1">
                            {selectedRoles?.map((role, idx) => {
                                return (
                                    <div key={idx} className="flex">
                                        <span className="rounded-l-lg bg-blue-500 px-1.5 py-0.5 pr-0.5 text-sm text-white">
                                            {role}
                                        </span>
                                        <span
                                            onClick={e => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                removeRole(role)
                                            }}
                                            className="flex cursor-pointer items-center rounded-r-lg bg-blue-500 px-1.5 pl-1 text-sm text-white hover:bg-blue-300">
                                            <XIcon className="inline-block h-3 w-3" />
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <SelectorIcon
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0">
                        <Listbox.Options
                            static
                            className="shadow-xs absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md rounded-md border border-gray-200 bg-white py-1 text-base shadow-lg focus:outline-none">
                            {roles?.map(role => (
                                <Listbox.Option
                                    key={role}
                                    value={role}
                                    className={({ active }) => {
                                        return classNames(
                                            'relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                                            active ? 'bg-gray-100' : ''
                                        )
                                    }}>
                                    {({ active, selected }) => {
                                        return (
                                            <>
                                                <span
                                                    className={classNames(
                                                        'block truncate',
                                                        selected
                                                            ? 'font-semibold'
                                                            : 'font-normal'
                                                    )}>
                                                    {role}
                                                </span>
                                                {selected && (
                                                    <span
                                                        className={classNames(
                                                            'absolute inset-y-0 right-0 flex items-center pr-4 text-emerald-600',
                                                            active ? '' : ''
                                                        )}>
                                                        <svg
                                                            className="h-5 w-5"
                                                            viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                                clipRule="evenodd"
                                                            />
                                                        </svg>
                                                    </span>
                                                )}
                                            </>
                                        )
                                    }}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </Listbox>
            </div>
            <div className="mb-2 py-1">
                <InputSwitch
                    name="verify-email"
                    defaultValue={enableAccount}
                    onChange={checked => setEnableAccount(checked)}>
                    <span className="text-sm font-medium text-gray-700">
                        Enable Account
                    </span>
                </InputSwitch>
            </div>
            <div className="mb-8 py-1">
                <InputSwitch
                    name="verify-email"
                    defaultValue={verifyEmail}
                    onChange={checked => setVerifyEmail(checked)}>
                    <span className="text-sm font-medium text-gray-700">
                        Email Verified
                    </span>
                </InputSwitch>
            </div>
            <div className="flex justify-end gap-x-2">
                <Button
                    type="button"
                    buttonType="light"
                    disabled={loading}
                    onClick={handleClose}
                    className="hover:text-gray-700">
                    Cancel
                </Button>
                <Button type="submit" buttonType="primary" loading={loading}>
                    {user?.id ? 'Update Account' : 'Create Account'}
                </Button>
            </div>
        </form>
    )
}

export default UserForm
