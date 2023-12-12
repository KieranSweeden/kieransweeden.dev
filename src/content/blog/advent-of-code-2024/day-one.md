---
title: 'Day 1'
description: 'Rust solutions for the day 1 Advent of Code challenges'
pubDate: 'Dec 2 2023'
heroImage: '/blog-placeholder-4.jpg'
isDraft: true
---

# Part 1

## The problem

For this challenge, we're retrieving a calibration value for each line of input and calculating the total sum of these values. This total sum calculated will be our answer.

The challenge states that to retrieve the calibration value for each line, we'll need to take the first digit and the last digit that appears for each line and concatanate them in that specific order, to form a single two-digit number being that line's calibration value.

As an example, let's look at the example input given within this challenge:

```
1abc2
pqr3stu8vwx
a1b2c3d4e5f
treb7uchet
```

For the first line, the first digit is 1 and the last is 2. When concatenating these digits, we get 12 as the calibration value for that line. For the second line, following the same pattern, we get 38 as the calibration value. Continuing on...

```
1abc2 // "1" + "2" = "12"
pqr3stu8vwx // "3" + "8" = "38"
a1b2c3d4e5f // "1" + "5" = "15"
treb7uchet // "7" + "7" = "77"
```

The last line in the example is something to take note of. It indicates to us that if there is only 1 digit within that line, that digit can be used as both the first and last digit representing that line.

## The research

After reading through this challenge, it was evident that this problem could be solved in a multitude of ways. Personally speaking, it was important that I looked for the most efficient way of retrieving the answer within my abilities. With this in mind, I headed over the the Rust documentation and investigated what methods were available for me to use within the `std::string::String` struct.

During my search of the `String` struct, I came across the [find()](https://doc.rust-lang.org/std/string/struct.String.html#method.find) and [rfind()](https://doc.rust-lang.org/std/string/struct.String.html#method.rfind) methods respectively.

The `find` method returns the first byte index of the `char` that matches the pattern passed into it.

```rust
pub fn find<'a, P>(&'a self, pat: P) -> Option<usize>
```

Whereas unsurprisingly, `rfind` returns the last byte index of the `char` that matches a given pattern.

```rust
pub fn rfind<'a, P>(&'a self, pat: P) -> Option<usize>
```

Both methods return the `usize` type and wrap them within an `Option` enum. Given an `Option` is returned, we'll need to handle the error case that `None` is returned rather than a `Some`. Although I imagine this shouldn't be an issue within the context of [Advent of Code](https://adventofcode.com), I see it as an opportunity to better understand error handling in Rust.

Now I've found `String` methods which I believe will aid me in solving this problem, it's time to determine what pattern I'll pass into these functions as a predicate to retrieve string digits. Co-incidentally, the `find` method had examples indicating how it could be used and the examples somewhat relevant to my use case were the following:

```rust
assert_eq!(s.find(char::is_whitespace), Some(5));
assert_eq!(s.find(char::is_lowercase), Some(1));
```

The use of associated functions provided by the primitive `char` type seemed relevant for my use case. With this in mind, I searched through the `char` documentation and came across the [is_digit](https://doc.rust-lang.org/std/primitive.char.html#method.is_digit) function. `is_digit` returns a boolean if `self` is a digit within a given radix.

```rust
pub fn is_digit(self, radix: u32) -> bool
```

A base of 10 is required in my use case, which the documentation itself states is supported within this method. With this in mind, I can move forward in implementing the solution to this problem.


## The solution

### The pattern

The pattern I'll be working with for this challenge (and likely later challenges), is by having the `main` function performing the following tasks:

- Get the input text as a `str` using the `include_str!` macro.
- Get the answer/output from processing the `str`.
- Debug the given answer to the console.

The source code looks like this:

```rust
fn main() {
    let input = include_str!("./input1.txt"); // get file text
    let output = process(input); // process the text
    dbg!(output); // print the answer to the console
}
```

Seperating the binary exeuction of the file (I.e. `main`) from the challenge's solution (I.e. the `process` function) allows me to directly test the solution prior to executing the binary which makes use of the challenge's input text.

This means when I'm building my solution, I can use `cargo test` throughout until my tests pass. When that moment comes, I can then execute `cargo run` which'll debug the output/answer I'll need to pass the challenge.

### The tests

To determine what tests we'll build, let's first recap step-by-step as to what the process will be for each line of the input.

1. Retrieve the first base 10 digit.
2. Retrieve the last base 10 digit.
3. Concatenate the digits to form a two-digit string.
4. Return the two-digit string as an integer type.

> We'll want to return the digits as an integer, as it'll then allow us to calculate the total sum of all the calibration values.

I believe it's worth building tests for processes 1 & 2 given we're building on top of `std` functions with preset values given as arguments. Processes 3 & 4 are exempt from being tested as I believe they're too fundamental to the language to be worth testing. With this in mind, let's get to testing!

The tests for retrieving the first and last base 10 digits are as follows:

```rust
#[test]
fn get_first_base_10_char_passes() {
    let input = "pqr3stu8vwx";
    let result = get_first_base_10_char(input).unwrap();
    assert_eq!(result, '3');
}

#[test]
fn get_last_base_10_char_passes() {
    let input = "pqr3stu8vwx";
    let result = get_last_base_10_char(input).unwrap();
    assert_eq!(result, '8');
}
```

### The implementation

During the implementation of the `get_first_base_10_char` function, I realised that the use of the `find` & `rfind` functions would not be the most efficient way of retrieving chars. This is due to the fact that in the worst case scenario, I'd have to iterate over the character's contained within the string twice. This is shown here:

```rust
fn get_first_base_10_char(input: &str) -> Option<char> {
    let index_result = input.find(|c: char| c.is_digit(BASE_TEN_RADIX)); // first iteration
    match index_result {
        Some(index) => input.chars().nth(index), // second iteration
        None => None,
    }
}
```

> Something to note here, is that I made the assumption that there would be a way to retrieve a `char` from a `&str` just by using an integer representing the target index. I imagine it would've returned an `Option` that I could simply `unwrap()` with little concern, given I'd already know that a character at that index exists. This assumption I believe is wrong, however if you say otherwise, please get in touch as I'd like to hear from you regarding it.

A simpler and more peformant solution to this problem would be the following:

```rust
fn get_first_base_10_char(input: &str) -> Option<char> {
    for character in input.chars() { // only one iteration
        if character.is_digit(BASE_TEN_RADIX) {
            return Some(character); // return Option enum Some for first found base 10 digit
        }
    }
    None // return Option enum Some when no base 10 digit found
}
```

The get last base 10 solution is almost identical, except that the iterator is also given the `rev()` function so the characters are iterated over in reverse order. The solution is the following:

```rust
fn get_last_base_10_char(input: &str) -> Option<char> {
    for character in input.chars().rev() { // only one iteration
        if character.is_digit(BASE_TEN_RADIX) {
            return Some(character); // return Option enum Some for last found base 10 digit
        }
    }
    None // return Option enum Some when no base 10 digit found
}
```

After running `cargo test`, both functions passed! I also included an additional assertion for each test to check for cases where a string has no base 10 digits within it. Here are those tests in full:

```rust
#[test]
fn get_first_base_10_char_passes() {
    let input = "pqr3stu8vwx";
    let result = get_first_base_10_char(input);
    assert_eq!(result.unwrap(), '3');

    let input = "abcdefg";
    let result = get_first_base_10_char(input);
    assert_eq!(result, None);
}

#[test]
fn get_last_base_10_char_passes() {
    let input = "pqr3stu8vwx";
    let result = get_last_base_10_char(input);
    assert_eq!(result.unwrap(), '8');

    let input = "abcdefg";
    let result = get_last_base_10_char(input);
    assert_eq!(result, None);
}
```

With the implementation done for retrieving both the first and last digits of a string, it was time to proceed with the processing of each string in the `process()` function called by `main()`.

The challenge expects us to map over each line and in the end sum it all together. Fortunately Rust's iterators already come with useful methods that'll be of use to us. Firstly the `lines()` method, which handily splits the lines of text and inserts them within an iterator ready for us to iterate over. Secondly we have the industry standard `map()`, which takes a closure, calls it against each entry and returns the returned value back into the iterator. Lastly is the `sum()` method, which handily sums together all of the values contained within the iterator. Here is roughly how using these methods will look:

```rust
fn process(input: &str) -> i32 {
    input
        .lines()
        .map(|line| -> i32 {
            // process to be implmented on each line 
        })
        .sum()
}
```

With this in place we can now look to implement the closure that'll execute on each line entry. We'll use our `get_first_base_10_char()` and `get_last_base_10_char()` functions for their respective purposes, concatenate what's returned from those functions, parse it into an integer type and return the parsed integer. Here's how that looks:

```rust
fn process(input: &str) -> i32 {
    input
        .lines()
        .map(|line| -> i32 {
            let first_digit_string = get_first_base_10_char(line).unwrap().to_string();
            let last_digit_string = get_last_base_10_char(line).unwrap().to_string();
            let two_digit_string = first_digit_string + &last_digit_string;
            let parsed_digit = two_digit_string.parse::<i32>().unwrap();
            parsed_digit
        })
        .sum()
}
```

### The reflection

Now, despite this working (hooray!), from my point of view after implementing this, it's clear there are some issues with this implementation. Those issues are that:

1. We're yet again iterating one more time than is necessary (hint hint, `fold()`).
2. After much trial and error, we can only concatenate characters if they're specifically strings, meaning we're having to convert them into strings outside of the functions which return a `char` type.
3. Errors cases are not being handled at all.

Let's address the first point...

By using `map()` and `sum()`, we're iterating over each line entry twice to retrieve the result which is sub-optimal. Instead of calling these, thankfully Rust has the `fold()` method which is analogous to the `reduce()` method in JavaScript. `fold()` "folds" every element into an accumulator by applying an operation on each entry of an iterator. The final iteration then returns the final value, in our case the total sum of digits retrieved from each line. Let's see how our code looks now:

```rust
fn process(input: &str) -> i32 {
    input.lines().fold(0, |total, line| -> i32 {
        let first_digit_string = get_first_base_10_char(line).unwrap().to_string();
        let last_digit_string = get_last_base_10_char(line).unwrap().to_string();
        let two_digit_string = first_digit_string + &last_digit_string;
        let parsed_digit = two_digit_string.parse::<i32>().unwrap();
        total + parsed_digit
    })
}
```

By making this change, I've halved the amount of times we're iterating over each line entry. Now let's look at the second problem.

To remind ourslves, the second problem was that I'm having to call `.to_string()` on both digit strings returned by `get_first_base_10_char()` and `get_last_base_10_char()`. This is due to (from my understanding) the limitation where strings can be concatenated but chars cannot. With this in mind, let's change those functions to return a `String` instead of a `char`;

```rust
fn get_first_base_10_digit(input: &str) -> Option<String> {
    for character in input.chars() {
        if character.is_digit(BASE_TEN_RADIX) {
            return Some(character.to_string());
        }
    }
    None
}

fn get_last_base_10_digit(input: &str) -> Option<String> {
    for character in input.chars().rev() {
        if character.is_digit(BASE_TEN_RADIX) {
            return Some(character.to_string());
        }
    }
    None
}
```

The tests have also been adapted to expect string types;

```rust
#[test]
fn get_first_base_10_char_passes() {
    let input = "pqr3stu8vwx";
    let result = get_first_base_10_digit(input);
    assert_eq!(result.unwrap(), "3"); // '3' -> "3"

    let input = "abcdefg";
    let result = get_first_base_10_digit(input);
    assert_eq!(result, None);
}

#[test]
fn get_last_base_10_char_passes() {
    let input = "pqr3stu8vwx";
    let result = get_last_base_10_digit(input);
    assert_eq!(result.unwrap(), "8"); // '8' -> "8"

    let input = "abcdefg";
    let result = get_last_base_10_digit(input);
    assert_eq!(result, None);
}
```

The `main()` function now looks slightly cleaner:

```rust
fn process(input: &str) -> i32 {
    input.lines().fold(0, |total, line| -> i32 {
        let first_digit_string = get_first_base_10_digit(line).unwrap();
        let last_digit_string = get_last_base_10_digit(line).unwrap();
        let two_digit_string = first_digit_string + &last_digit_string;
        let parsed_digit = two_digit_string.parse::<i32>().unwrap();
        total + parsed_digit
    })
}
```

Let's now address the last problem I had with the implementation of `process()`, it's error handling. What's immediately obvious is that we have multiple instances where we're using `unwrap()`. This is problematic as both `get_first_base_10_digit` & `get_last_base_10_digit` could return `None` and if that case occurs our program will panic. So we need to address this issue and the simple thing to do would be to error handle these cases inline, essentially replacing `unwrap()` with more appropriate error handling methods. However, what would be nice is if any errors were to be returned from the called functions, the strings contained within those errors would again be wrapped in another `Result::Err()` which the `process()` function would return. This allows me to attach a `?` to the end of each digit fetch function, which'll automatically wrap our error strings into a `Result::Err()` for me. This'll mean changing the signature of `get_first_base_10_digit` & `get_last_base_10_digit` to return a `Result` instead of an `Option`, as I did here:

```rust
fn get_first_base_10_digit(input: &str) -> Result<String, &str> {
    for character in input.chars() {
        if character.is_digit(BASE_TEN_RADIX) {
            return Ok(character.to_string());
        }
    }
    Err("No base-10 digit found in string")
}

fn get_last_base_10_digit(input: &str) -> Result<String, &str> {
    for character in input.chars().rev() {
        if character.is_digit(BASE_TEN_RADIX) {
            return Ok(character.to_string());
        }
    }
    Err("No base-10 digit found in string")
}
```

We can now replace the unwraps for the `get_first_base_10_digit` & `get_last_base_10_digit` with `?` and change the signature of process to return a `Result<i32, &str>` instead of just an `i32`.

```rust
fn process(input: &str) -> Result<i32, &str> {
    input
        .lines()
        .try_fold(0, |total, line| -> Result<i32, &str> {
            let first_digit_string = get_first_base_10_digit(line)?;
            let last_digit_string = get_last_base_10_digit(line)?;
            let two_digit_string = first_digit_string + &last_digit_string;
            let parsed_digit = two_digit_string.parse::<i32>().unwrap();
            Ok(total + parsed_digit)
        })
}
```

> The change to returning a result has also meant that we've have to replace `fold()` with `try_fold()`, which is essentially the some thing however it returns a `Result` where a successful fold returns an `Ok` containing our `i32` or an `Err` containing our error string.

There's one last `unwrap()` left to address, that being the `i32` parsing of the two digit string, which itself returns a `Result`. However, a key difference when compared to the returned `Result` specified in the the `process()` signature, is that it's error case specifically returns a `ParseIntError` as opposed to a `&str`. To handle this, I figured it was appropriate to use a `match` statement which returns an `Err` containing a `&str` so it matches the function's response type.

```rust
fn process(input: &str) -> Result<i32, &str> {
    input
        .lines()
        .try_fold(0, |total, line| -> Result<i32, &str> {
            let first_digit_string = get_first_base_10_digit(line)?;
            let last_digit_string = get_last_base_10_digit(line)?;
            let two_digit_string = first_digit_string + &last_digit_string;
            match two_digit_string.parse::<i32>() {
                Ok(parsed_digit) => Ok(total + parsed_digit),
                Err(_) => Err("Failed to parse two digit string into i32"),
            }
        })
}
```

The last piece left is ensuring that `main()` handles both `Ok` & `Err` cases when calling `process()`.

```rust
fn main() {
    let input = include_str!("./input1.txt");
    let output = process(input);
    match output {
        Ok(result) => {
            dbg!(result);
        }
        Err(err) => {
            eprintln!("{err}");
        }
    }
}
```

## The result

With the implementation complete, it was time to execute the binary and see what the answer for part 1 of day 1 is, which returned the following:

```
kieransweeden@Kierans-MacBook-Pro day-01 % cargo run --bin part1
   Compiling day-01 v0.1.0 (/Users/kieransweeden/Developer/rust/advent-of-code/2024/day-01)
    Finished dev [unoptimized + debuginfo] target(s) in 0.10s
     Running `target/debug/part1`
[src/bin/part1.rs:10] result = 53194
kieransweeden@Kierans-MacBook-Pro day-01 % 
```

**53194** was indeed the correct answer!

> [Click here](https://github.com/KieranSweeden/advent-of-code-2024/blob/main/day-01/src/bin/part1.rs) If you'd like to see the source code for this particular challenge.

# Part 2

This will be completed soon!



