// package com.edutech.dto;


// import com.fasterxml.jackson.annotation.JsonCreator;
// import com.fasterxml.jackson.annotation.JsonProperty;

// public class LoginRequest {

//     // write the code here
// }



//set2 
// package com.edutech.dto;

// public class LoginRequest {

//     private String username;
//     private String password;

//     public String getUsername() { return username; }
//     public String getPassword() { return password; }
// }


package com.edutech.dto;

public class LoginRequest {

    private String username;
    private String password;

    // ✅ REQUIRED by tests
    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // ✅ REQUIRED default constructor for Jackson
    public LoginRequest() {}

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }
}



