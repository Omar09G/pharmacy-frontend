import React, { useState } from 'react';
import useUsers from '../hooks/useUsers';
import { useEffect } from 'react';
import {
  showError,
  showSuccess,
} from '../../../../components/Alerts/AlertsComponent';
import { UserRequest } from '../../../../components/Admin/User/Utils/utils';

const UserForm: React.FC = () => {
  const { create, edit, selectedUser, setSelectedUser } = useUsers();
  const [form, setForm] = useState<Partial<UserRequest>>({
    id: 0,
    username: '',
    firstname: '',
    lastname: '',
    password: '',
    role: 'USER',
    country: '',
  });

  useEffect(() => {
    if (selectedUser) {
      setForm({ ...selectedUser, password: '' });
    }
  }, [selectedUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!form.username || !form.firstname || !form.lastname)
        return showError('Datos incompletos');
      if (selectedUser) {
        await edit(selectedUser.id, form as Partial<UserRequest>);
        showSuccess('Usuario actualizado', 'Los datos fueron actualizados');
        setSelectedUser(null);
      } else {
        await create(form as UserRequest);
        showSuccess('Usuario creado', 'Usuario agregado correctamente');
      }
      setForm({
        id: 0,
        username: '',
        firstname: '',
        lastname: '',
        password: '',
        role: 'USER',
        country: '',
      });
    } catch (err: unknown) {
      showError(
        (err instanceof Error && err.message) || 'Error al crear usuario',
      );
    }
  };

  return (
    <div className="w-full shadow mb-4 px-4 py-4 rounded-md bg-white">
      <h3 className="text-xl text-fuchsia-700 font-semibold mb-3">
        {selectedUser ? 'Editar usuario' : 'Crear usuario'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm">Nombre*</label>
          <input
            name="firstname"
            value={form.firstname || ''}
            onChange={handleChange}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm">UserName*</label>
          <input
            name="username"
            value={form.username || ''}
            onChange={handleChange}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
            placeholder="username (se usará como login)"
          />
        </div>
        <div>
          <label className="block text-sm">Apellido*</label>
          <input
            name="lastname"
            value={form.lastname || ''}
            onChange={handleChange}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm">País*</label>
          <input
            name="country"
            value={form.country || ''}
            onChange={handleChange}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm">Password*</label>
          <input
            name="password"
            value={form.password || ''}
            onChange={handleChange}
            type="password"
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          />
        </div>
        <div>
          <label className="block text-sm">Rol*</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="border border-gray-200 rounded-md px-3 py-2 text-sm w-full"
          >
            <option value="USER">Usuario</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <div className="text-xs text-fuchsia-700 bg-gray-50 gap-3 mt-5 px-2 py-1 rounded">
            Los campos con * son obligatorios
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition transform hover:-translate-y-0.5">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {selectedUser ? 'Actualizar usuario' : 'Crear usuario'}
          </button>

          {selectedUser && (
            <button
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setForm({
                  id: 0,
                  username: '',
                  firstname: '',
                  lastname: '',
                  password: '',
                  role: 'USER',
                  country: '',
                });
              }}
              className="inline-flex items-center gap-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserForm;
