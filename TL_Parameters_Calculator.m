% Transmission Line Parameter Calculator
% This program calculates total resistance, inductance and capacitance of a transmission line
clear;
clc;

% Select whether the conductor is single strand or multiple strands
fprintf('Are the conductors with single strand or multiple strands?\n');
strand_choice = input('Enter 1 for Single Strand, 2 for Multiple Strands: ');

if strand_choice == 2

    % Select the type of bundled conductor
    fprintf('\nSelect the type of conductor:\n');
    fprintf('1. 2-bundle\n2. 3-bundle\n3. 4-bundle\n4. 6/1 ACSR\n');
    bundle_type = input('Choice (1-4): ');

    % Radius of each strand
    r = input('Enter the radius of each strand (in meters): ');

    % Effective radius used for inductance calculation
    r_prime = 0.7788 * r;

    % Distance between strands is needed for bundle calculations
    if bundle_type ~= 4
        d = input('Enter the distance between bundled conductors (d in meters): ');
    end

    % Calculate equivalent GMR for inductance and capacitance
    switch bundle_type

        case 1
            % Formula for a 2-bundle conductor
            GMRL = sqrt(r_prime * d);
            GMRC = sqrt(r * d);
            area_multiplier = 2;

        case 2
            % Formula for a 3-bundle conductor
            GMRL = (r_prime * d^2)^(1/3);
            GMRC = (r * d^2)^(1/3);
            area_multiplier = 3;

        case 3
            % Formula for a 4-bundle conductor
            GMRL = 1.09 * (r_prime * d^3)^(1/4);
            GMRC = 1.09 * (r * d^3)^(1/4);
            area_multiplier = 4;

        case 4
            % Equivalent radius used for 6/1 ACSR
            GMRL = 2.177 * r;
            GMRC = 2.177 * r;
            area_multiplier = 6;
    end

    % Find the total cross-sectional area of the conductor
    A = area_multiplier * (pi * r^2);

else

    % For a single strand conductor, enter its radius
    r = input('\nEnter the radius of each conductor (in meters): ');

    % GMR used for inductance
    GMRL = 0.7788 * r;

    % Radius used for capacitance
    GMRC = r;

    % Area of the conductor
    A = pi * r^2;
end


% Select whether the system is single phase or three phase
fprintf('\nSelect system type:\n');
phase_choice = input('Enter 1 for Single Phase, 2 for Three Phase: ');

if phase_choice == 1

    % For single phase, GMD is equal to the distance between
    % the two conductors
    D = input('Enter the distance (D) between both conductors (in meters): ');
    GMD = D;

else

    % Select single circuit or double circuit
    fprintf('\nSelect Three Phase system type:\n');
    ckt_choice = input('Enter 1 for Single Circuit, 2 for Double Circuit: ');

    if ckt_choice == 1

        % Enter the distances between the three phases
        fprintf('\nEnter the values for Single Circuit (in meters):\n');
        D12 = input('D12: ');
        D23 = input('D23: ');
        D31 = input('D31: ');

        % Calculate GMD for a three phase single circuit
        GMD = (D12 * D23 * D31)^(1/3);

    else

        % Enter distances for the double circuit arrangement
        fprintf('\nEnter the values for Double Circuit (in meters):\n');
        D12 = input('D12: ');
        D23 = input('D23: ');
        D31 = input('D31: ');
        d1 = input('d1 (cross-distance 1): ');
        d2 = input('d2 (cross-distance 2): ');
        d3 = input('d3 (cross-distance 3): ');
        d4 = input('d4 (cross-distance 4): ');

        % Calculate GMD for each phase pair
        GMDA = (D12 * d1 * d2 * d3)^(1/4);
        GMDB = (D23 * d2 * d3 * d4)^(1/4);
        GMDC = (D31 * d1 * d3 * d4)^(1/4);

        % Overall GMD of the double circuit
        GMD = (GMDA * GMDB * GMDC)^(1/3);

        % Calculate equivalent GMR for the double circuit
        GMRL = (GMRL * d1 * d2 * d3)^(1/4);
        GMRC = (GMRC * d1 * d2 * d3)^(1/4);
    end
end


% Enter resistivity and length of the transmission line
fprintf('\n');
rho = input('Enter the resistivity of the conductor (rho in ohm-meters): ');
L_len = input('Enter the line length (l in meters): ');


% Calculate total resistance using R = rho*l/A
R = (rho * L_len) / A;


% Calculate inductance per metre
L_per_m = 2e-7 * log(GMD / GMRL);

% Calculate total inductance
L_total = L_per_m * L_len;


% Permittivity of free space
epsilon_0 = 8.854e-12;

% Calculate capacitance per metre
C_per_m = (2 * pi * epsilon_0) / log(GMD / GMRC);

% Calculate total capacitance
C_total = C_per_m * L_len;


% Display the final results
fprintf('\n======================================\n');
fprintf('     TRANSMISSION LINE PARAMETERS     \n');
fprintf('======================================\n');

fprintf('Total Resistance (R)  : %.6e Ohms\n', R);
fprintf('Total Inductance (L)  : %.6e Henries\n', L_total);
fprintf('Total Capacitance (C) : %.6e Farads\n', C_total);

fprintf('======================================\n');