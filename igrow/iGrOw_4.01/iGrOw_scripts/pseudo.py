

for i in range(maxiter2):
    for j in range(maxiter1):
        converged = linear_solve()
        if converged:
            break
        
    update_q_base()
    critdiff = adjustgrid()

    for j in range(maxiter1):
        converged = linear_solve()
        if converged:
            break

    if critdiff < maxdiffHY:
        break
    

for i in range(maxiter2):
    setupeqs()  # includes qbase formulation
    for j in range(maxiter1):
        converged = linear_solve_step()
        if converged:
            break
    critdiff = adjustgrid()
    if critdiff < maxdiffHY:
        break