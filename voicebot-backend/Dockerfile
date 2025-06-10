# === Stage 1: Build environment ===
FROM python:3.11-slim as builder

# Install only required build tools
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        cmake \
        git \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install dependencies (build time only)
COPY requirements.txt ./
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Install llama-cpp-python (compiled here)
ENV CMAKE_ARGS="-DLLAMA_NATIVE=OFF" \
    FORCE_CMAKE=1 \
    LLAMA_CMAKE_ARGS="-DLLAMA_NATIVE=OFF"

RUN pip install --no-cache-dir --prefix=/install llama-cpp-python==0.3.9

# === Stage 2: Runtime environment ===
FROM python:3.11-slim as runtime

# Install runtime-only system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ffmpeg \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy installed packages from builder stage
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
