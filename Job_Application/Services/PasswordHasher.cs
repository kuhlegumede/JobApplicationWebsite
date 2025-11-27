using System.Security.Cryptography;
using System.Text;
namespace Job_Application.Services;

public static class PasswordHasher
{
    //Creates hashed version of password with a unique salt.
    public static void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
    {
        //Instantiate HMACSHA512 to generate a cryptographic hash and a unique key(salt).
        using(var hmac = new HMACSHA512())
        {
            //Assign the generated salt to the output.
            passwordSalt = hmac.Key;
            //Convert the plaintext password into bytes using UTF-8.
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            //Compute the hash of the password bytes using the HMACSHA512 instance.
            //Assign the computed hash to the output parameter.
            passwordHash = hmac.ComputeHash(passwordBytes);
            
        }
    }
    //Verify whether the password matches the stored hash using the stored salt.
    //Return true if password is valid and matches the stored hash, otherwise false.
    public static bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
    {
        // Instantiate HMACSHA512 with the stored salt as the key to ensure the same hashing parameters.
        using(var hmac = new HMACSHA512(storedSalt))
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password);
            // Compute the hash of the password bytes using the HMACSHA512 instance initialized with the stored salt.
            byte[] computedHash = hmac.ComputeHash(passwordBytes);
            //Compare computed hash with the stored hash byte by byte.
            //If sequence is equal then both byte arrays are identical in sequence and value.
            bool hashesMatch = computedHash.SequenceEqual(storedHash);
            return hashesMatch;
        }
    }
}
