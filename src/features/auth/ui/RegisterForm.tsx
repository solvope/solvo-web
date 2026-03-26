'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { registerSchema, type RegisterInput } from '../lib/authSchemas'
import { useAuthStore } from '../model/useAuthStore'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/ui/form'

export function RegisterForm() {
  const router = useRouter()
  const { register: registerUser } = useAuthStore()
  const [showPass, setShowPass] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', dni: '', phone: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: RegisterInput) => {
    try {
      const { confirmPassword: _, ...dto } = values
      await registerUser(dto)
      toast.success('¡Cuenta creada! Revisa tu email para verificar tu cuenta.')
      router.push('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al crear la cuenta')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>Nombres</FormLabel>
              <FormControl><Input placeholder="Juan" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Apellidos</FormLabel>
              <FormControl><Input placeholder="Pérez" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="dni" render={({ field }) => (
            <FormItem>
              <FormLabel>DNI</FormLabel>
              <FormControl><Input placeholder="12345678" maxLength={8} {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>Teléfono</FormLabel>
              <FormControl><Input placeholder="987654321" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="email" render={({ field }) => (
          <FormItem>
            <FormLabel>Correo electrónico</FormLabel>
            <FormControl><Input type="email" placeholder="tu@email.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Contraseña</FormLabel>
            <FormControl>
              <div className="relative">
                <Input type={showPass ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" {...field} className="pr-10" />
                <button type="button" onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar contraseña</FormLabel>
            <FormControl><Input type="password" placeholder="Repite tu contraseña" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Creando cuenta...</>
            : 'Crear cuenta'}
        </Button>
      </form>
    </Form>
  )
}
