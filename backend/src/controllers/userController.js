import * as userService from '../services/userService.js';

// CREATE
export const register = async (req, res) => {
  const newUser = await userService.createUser(req.body);
  res.status(201).json({
    message: 'User created successfully!',
    user: newUser,
  });
};

// READ
export const getAll = async (req, res) => {
  const users = await userService.getAllUsers();
  res.status(200).json(users);
};

export const getById = async (req, res) => {
  const { id } = req.params;
  const user = await userService.getUserById(id);
  res.status(200).json(user);
};

export const getMe = async (req, res) => {
  const userId = req.user.id;
  const user = await userService.getUserById(userId);
  res.status(200).json(user);
};

// UPDATE
export const update = async (req, res) => {
  const { id: targetUserId } = req.params; // ID do usuário a ser atualizado
  const { id: requesterId, role: requesterRole } = req.user; // Dados do usuário que está fazendo a requisição

  // Permite a ação se o usuário for ADMIN OU se estiver tentando editar seu próprio perfil
  if (targetUserId !== requesterId && requesterRole !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: You can only update your own profile.' });
  }

  const updatedUser = await userService.updateUser(targetUserId, req.body);
  res.status(200).json({ message: 'User updated successfully!', user: updatedUser });
};

// DELETE
export const remove = async (req, res) => {
  const { id } = req.params;
  await userService.deleteUser(id);
  res.status(204).send(); // 204 No Content é uma resposta padrão para delete bem-sucedido
};