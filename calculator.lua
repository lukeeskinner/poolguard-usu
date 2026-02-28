-- Simple Lua Calculator

local function calculate(expr)
    -- Safely evaluate a math expression
    local fn = load("return " .. expr)
    if fn then
        local ok, result = pcall(fn)
        if ok then return result end
    end
    return nil, "Invalid expression"
end

local function print_help()
    print("Lua Calculator")
    print("--------------")
    print("Enter math expressions like: 2 + 3, 10 / 4, 2 ^ 8, math.sqrt(16)")
    print("Type 'quit' or 'exit' to close.")
    print()
end

print_help()

while true do
    io.write("> ")
    local input = io.read()

    if not input then break end

    input = input:match("^%s*(.-)%s*$") -- trim whitespace

    if input == "quit" or input == "exit" then
        print("Goodbye!")
        break
    elseif input == "" then
        -- skip empty input
    elseif input == "help" then
        print_help()
    else
        local result, err = calculate(input)
        if result ~= nil then
            print("= " .. tostring(result))
        else
            print("Error: " .. (err or "unknown error"))
        end
    end
end
