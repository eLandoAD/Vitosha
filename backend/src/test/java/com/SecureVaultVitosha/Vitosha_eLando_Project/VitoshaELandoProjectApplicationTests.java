package com.SecureVaultVitosha.Vitosha_eLando_Project;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class VitoshaELandoProjectApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointReturns200() throws Exception {
        mockMvc.perform(get("/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("OK"));
    }

    @Test
    void registerWithMissingEmailReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"password\":\"password123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerWithShortPasswordReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@test.com\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginWithWrongCredentialsReturns401() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"wrong@test.com\",\"password\":\"wrongpassword\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void downloadNonExistentFileReturns404() throws Exception {
        mockMvc.perform(get("/files/download/99999"))
                .andExpect(status().isNotFound());
    }
}