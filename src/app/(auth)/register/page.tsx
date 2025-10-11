import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-lg">
      <header className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Crear cuenta</h1>
        <p className="text-sm text-gray-600">
          Completa el formulario para unirte al portal de agentes.
        </p>
      </header>

      <form className="space-y-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Nombre completo</span>
          <input
            type="text"
            placeholder="Ingresa tu nombre"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Correo corporativo</span>
          <input
            type="email"
            placeholder="nombre@empresa.com"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Contrasena</span>
          <input
            type="password"
            placeholder="Crea una contrasena segura"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>

        <button
          type="submit"
          className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
        >
          Registrarme
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Ya tienes cuenta?{" "}
        <Link className="font-semibold text-blue-600 hover:underline" href="/login">
          Inicia sesion
        </Link>
      </p>
    </div>
  );
}
