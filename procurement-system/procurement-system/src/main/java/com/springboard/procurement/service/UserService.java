package com.springboard.procurement.service;

import com.springboard.procurement.entity.User;
import java.util.List;

public interface UserService
{
    User saveUser(User user);

    List<User> getAllUsers();

    User getUserById(Long id);

    void deleteUser(Long id);
}
