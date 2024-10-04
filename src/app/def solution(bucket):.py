def solution(buckets):
    # Step 1: Get the indices of the balls (B's)
    ball_indices = [i for i, c in enumerate(buckets) if c == 'B']
    
    # Step 2: Calculate the number of balls
    num_balls = len(ball_indices)
    
    # If there's only 1 ball or fewer, no moves are needed, it's trivially correct
    if num_balls <= 1:
        return 0
    
    # Step 3: Check if we have enough space to place all balls with gaps of 2
    required_space = (num_balls - 1) * 2  # Total space needed to fit balls correctly
    if required_space > len(buckets) - ball_indices[0] - 1:
        return -1  # Not enough space to fit all balls
    
    # Step 4: Generate the correct target positions for the balls
    # We'll place the balls at positions with a gap of 2 between them, starting from the first position
    middle_ball_index = num_balls // 2
    start_position = ball_indices[middle_ball_index] - middle_ball_index * 2
    target_positions = list(range(start_position, start_position + num_balls * 2, 2))
    
    # Check if the last target position exceeds the buckets length
    if target_positions[-1] >= len(buckets):
        return -1  # If the last ball cannot fit, return -1
    
    # Step 5: Calculate the minimum number of moves required
    moves = 0
    for current_position, target_position in zip(ball_indices, target_positions):
        moves += abs(current_position - target_position)
    
    return moves

print(solution(".B...B.BB"))  # Expected output: 2
print(solution("BB.B.BBB..."))  # Expected output: 4
print(solution(".BBB.B"))  # Expected output: -1 (impossible case)
print(solution("......B..B"))  # Expected output: 0 (already correct)
