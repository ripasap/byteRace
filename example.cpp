#include <iostream>
#include <fstream>

extern "C"
{
    void run()
    {
        std::ofstream outFile("example.txt");
        outFile << "Hello from Emscripten!" << std::endl;
        outFile.close();

        std::cout << "File written!" << std::endl;
    }
}